/**
 * LessonNode — Trilha visual de lições de um módulo.
 *
 * Usa SVG para desenhar as elipses (formato oval real com pontas afinadas)
 * e as linhas de conexão entre elas.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Ellipse, Line } from 'react-native-svg';
import { Theme } from '../constants/colors';

// ── Geometria das elipses ─────────────────────────────────────────────────────
const RX = 48;
const RY = 14;
const SPACING = 120;
const NUM_ABOVE = 28;
const CARD_WIDTH = 190;

const STATUS_LABEL: Record<Lesson['status'], string> = {
  completed: 'Concluída',
  available: 'Disponível',
  locked:    'Bloqueada',
};

const FILL_COLOR: Record<Lesson['status'], string> = {
  completed: Theme.lessonNodeCompleted,
  available: Theme.lessonNodeAvailable,
  locked:    Theme.lessonNodeLocked,
};

export interface Lesson {
  id: string;
  title: string;
  status: 'locked' | 'available' | 'completed';
  description?: string;
}

export interface LessonNodeProps {
  title: string;
  lessons: Lesson[];
  onStart?: (lesson: Lesson) => void;
  hideHeader?: boolean;
  onAvailableLessonY?: (localY: number) => void;
}

interface CardAnchor {
  lesson: Lesson;
  pageY: number;
  pageCX: number;
}

export default function LessonNode({
  title,
  lessons,
  onStart,
  hideHeader = false,
  onAvailableLessonY,
}: LessonNodeProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [trackWidth, setTrackWidth] = useState(0);
  const layoutWidth = trackWidth > 0 ? trackWidth : windowWidth;

  const cxLeft = Math.round(layoutWidth * 0.25);
  const cxRight = Math.round(layoutWidth * 0.75);
  const getCX = useCallback(
    (i: number) => (i % 2 === 0 ? cxLeft : cxRight),
    [cxLeft, cxRight]
  );

  const [anchor, setAnchor] = useState<CardAnchor | null>(null);
  const containerRef = useRef<View>(null);

  const getCenter = useCallback(
    (i: number) => ({
      cx: getCX(i),
      cy: i * SPACING + NUM_ABOVE + RY,
    }),
    [getCX]
  );

  const svgHeight =
    (lessons.length - 1) * SPACING + NUM_ABOVE + RY * 2 + 40;

  const completedCount = lessons.filter((l) => l.status === 'completed').length;
  const progressPercent =
    lessons.length > 0
      ? Math.round((completedCount / lessons.length) * 100)
      : 0;

  React.useEffect(() => {
    if (!onAvailableLessonY || layoutWidth <= 0) return;
    const idx = lessons.findIndex((l) => l.status === 'available');
    if (idx === -1) return;

    const timer = setTimeout(() => {
      containerRef.current?.measureInWindow((_x, containerPageY) => {
        const { cy } = getCenter(idx);
        onAvailableLessonY(containerPageY + cy);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [lessons, onAvailableLessonY, layoutWidth, getCenter]);

  function handleEllipsePress(lesson: Lesson, localCX: number, localCY: number) {
    if (anchor?.lesson.id === lesson.id) {
      setAnchor(null);
      return;
    }

    containerRef.current?.measureInWindow((x, _y) => {
      const pageY = _y + localCY + RY + 8;
      const pageCX = x + localCX;
      setAnchor({ lesson, pageY, pageCX });
    });
  }

  function cardLeft(pageCX: number) {
    return Math.max(8, Math.min(pageCX - CARD_WIDTH / 2, windowWidth - CARD_WIDTH - 8));
  }

  function cardTop(pageY: number): number {
    const CARD_ESTIMATED_HEIGHT = 130;
    if (pageY + CARD_ESTIMATED_HEIGHT > windowHeight - 20) {
      return pageY - CARD_ESTIMATED_HEIGHT - RY * 2 - 16;
    }
    return pageY;
  }

  const canRenderTrack = layoutWidth > 0 && lessons.length > 0;

  return (
    <View
      ref={containerRef}
      style={styles.container}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && w !== trackWidth) setTrackWidth(w);
      }}
    >
      {!hideHeader && (
        <View style={styles.header}>
          <Text style={styles.headerText}>{title}</Text>
          <Text style={styles.headerSub}>
            {completedCount}/{lessons.length} lições · {progressPercent}%
          </Text>
          <View style={styles.headerProgressBg}>
            <View style={[styles.headerProgressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      )}

      <View style={{ height: canRenderTrack ? svgHeight : 0, width: '100%' }}>
        {canRenderTrack && (
          <>
            <Svg
              width={layoutWidth}
              height={svgHeight}
              style={styles.svg}
              pointerEvents="none"
            >
              {lessons.map((lesson, i) => {
                if (i === lessons.length - 1) return null;
                const from = getCenter(i);
                const to = getCenter(i + 1);
                return (
                  <Line
                    key={`ln-${i}`}
                    x1={from.cx}
                    y1={from.cy}
                    x2={to.cx}
                    y2={to.cy}
                    stroke={
                      lesson.status === 'completed'
                        ? Theme.lessonPathCompleted
                        : Theme.lessonPathIdle
                    }
                    strokeWidth={2}
                  />
                );
              })}

              {lessons.map((lesson, i) => {
                const { cx, cy } = getCenter(i);
                return (
                  <Ellipse
                    key={`el-${lesson.id}`}
                    cx={cx}
                    cy={cy}
                    rx={RX}
                    ry={RY}
                    fill={FILL_COLOR[lesson.status]}
                  />
                );
              })}
            </Svg>

            {lessons.map((lesson, i) => {
              const { cx, cy } = getCenter(i);
              const isLocked = lesson.status === 'locked';

              return (
                <React.Fragment key={`ov-${lesson.id}`}>
                  <Text
                    style={[
                      styles.number,
                      isLocked && styles.numberLocked,
                      {
                        position: 'absolute',
                        left: cx - 20,
                        top: cy - NUM_ABOVE - RY + 2,
                        width: 40,
                      },
                    ]}
                  >
                    {i + 1}
                  </Text>

                  <TouchableOpacity
                    disabled={isLocked}
                    activeOpacity={0.7}
                    style={{
                      position: 'absolute',
                      left: cx - RX,
                      top: cy - RY,
                      width: RX * 2,
                      height: RY * 2,
                    }}
                    onPress={() => handleEllipsePress(lesson, cx, cy)}
                    accessibilityRole="button"
                    accessibilityLabel={`Lição ${i + 1}: ${lesson.title}`}
                    accessibilityState={{ disabled: isLocked }}
                  />
                </React.Fragment>
              );
            })}
          </>
        )}
      </View>

      <Modal
        visible={anchor !== null}
        transparent
        animationType="none"
        onRequestClose={() => setAnchor(null)}
      >
        <TouchableWithoutFeedback onPress={() => setAnchor(null)}>
          <View style={styles.modalOverlay}>
            {anchor && (
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={[
                    styles.card,
                    {
                      top: cardTop(anchor.pageY),
                      left: cardLeft(anchor.pageCX),
                    },
                  ]}
                >
                  <Text style={styles.cardTitle}>{anchor.lesson.title}</Text>
                  <Text style={styles.cardStatus}>{STATUS_LABEL[anchor.lesson.status]}</Text>

                  {anchor.lesson.description ? (
                    <Text style={styles.cardDesc}>{anchor.lesson.description}</Text>
                  ) : null}

                  {anchor.lesson.status === 'available' && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => {
                        const lesson = anchor.lesson;
                        setAnchor(null);
                        onStart?.(lesson);
                      }}
                    >
                      <Text style={styles.actionBtnText}>Iniciar</Text>
                    </TouchableOpacity>
                  )}

                  {anchor.lesson.status === 'completed' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.reviewBtn]}
                      onPress={() => {
                        const lesson = anchor.lesson;
                        setAnchor(null);
                        onStart?.(lesson);
                      }}
                    >
                      <Text style={styles.actionBtnText}>Revisar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Theme.screenBackground,
    paddingBottom: 24,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    color: Theme.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSub: {
    color: Theme.textMuted,
    fontSize: 12,
  },
  headerProgressBg: {
    width: '80%',
    height: 5,
    backgroundColor: Theme.lessonCardBg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  headerProgressFill: {
    height: '100%',
    backgroundColor: Theme.lessonPathCompleted,
    borderRadius: 3,
  },
  number: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  numberLocked: {
    color: 'rgba(255,255,255,0.3)',
    textShadowColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    backgroundColor: Theme.lessonCardBg,
    borderRadius: 12,
    padding: 12,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTitle: {
    color: Theme.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardStatus: {
    color: Theme.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },
  cardDesc: {
    color: Theme.textSubtle,
    fontSize: 11,
    marginBottom: 8,
  },
  actionBtn: {
    backgroundColor: Theme.lessonNodeAvailable,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  reviewBtn: {
    backgroundColor: Theme.lessonReviewBtn,
  },
  actionBtnText: {
    color: Theme.text,
    fontWeight: '700',
    fontSize: 13,
  },
});
