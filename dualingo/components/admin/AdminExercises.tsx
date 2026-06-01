/**
 * AdminExercises — CRUD de exercícios.
 *
 * Permite criar, editar e excluir exercícios dentro de uma lição.
 * Suporta os tipos: multiple_choice e true_false.
 */

import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/colors";

type ExerciseType = "multiple_choice" | "true_false";

interface Exercise {
  id: string;
  lessonId: string;
  lessonName: string;
  type: ExerciseType;
  question: string;
  options: string[];
  correctAnswer: string;
  order: number;
}

// Dados iniciais para demonstração
const INITIAL_EXERCISES: Exercise[] = [
  {
    id: "1",
    lessonId: "1",
    lessonName: "O que é React Native?",
    type: "multiple_choice",
    question: "Qual empresa criou o React Native?",
    options: ["Google", "Meta (Facebook)", "Apple", "Microsoft"],
    correctAnswer: "Meta (Facebook)",
    order: 1,
  },
  {
    id: "2",
    lessonId: "1",
    lessonName: "O que é React Native?",
    type: "true_false",
    question: "React Native compila para código nativo.",
    options: ["Verdadeiro", "Falso"],
    correctAnswer: "Verdadeiro",
    order: 2,
  },
  {
    id: "3",
    lessonId: "4",
    lessonName: "O que é Cloud?",
    type: "multiple_choice",
    question: "Qual é o modelo de serviço que fornece infraestrutura sob demanda?",
    options: ["SaaS", "PaaS", "IaaS", "FaaS"],
    correctAnswer: "IaaS",
    order: 1,
  },
];

export default function AdminExercises() {
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // Campos do formulário
  const [question, setQuestion] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [type, setType] = useState<ExerciseType>("multiple_choice");
  const [options, setOptions] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [order, setOrder] = useState("");

  function handleAdd() {
    setEditingExercise(null);
    setQuestion("");
    setLessonId("");
    setType("multiple_choice");
    setOptions("");
    setCorrectAnswer("");
    setOrder("");
    setModalVisible(true);
  }

  function handleEdit(exercise: Exercise) {
    setEditingExercise(exercise);
    setQuestion(exercise.question);
    setLessonId(exercise.lessonId);
    setType(exercise.type);
    setOptions(exercise.options.join(", "));
    setCorrectAnswer(exercise.correctAnswer);
    setOrder(String(exercise.order));
    setModalVisible(true);
  }

  function handleDelete(exercise: Exercise) {
    const confirmed = typeof window !== "undefined"
      ? window.confirm("Deseja excluir este exercício?")
      : true;

    if (confirmed) {
      setExercises((prev) => prev.filter((e) => e.id !== exercise.id));
    }
  }

  function handleSave() {
    if (!question.trim()) {
      Alert.alert("Erro", "A pergunta é obrigatória.");
      return;
    }
    if (!lessonId.trim()) {
      Alert.alert("Erro", "O ID da lição é obrigatório.");
      return;
    }
    if (!correctAnswer.trim()) {
      Alert.alert("Erro", "A resposta correta é obrigatória.");
      return;
    }

    // Converte as opções separadas por vírgula em array
    const optionsArray = type === "true_false"
      ? ["Verdadeiro", "Falso"]
      : options.split(",").map((o) => o.trim()).filter(Boolean);

    if (type === "multiple_choice" && optionsArray.length < 2) {
      Alert.alert("Erro", "Informe ao menos 2 opções separadas por vírgula.");
      return;
    }

    // Valida que a resposta correta está nas opções
    if (!optionsArray.includes(correctAnswer.trim())) {
      Alert.alert("Erro", "A resposta correta deve ser uma das opções.");
      return;
    }

    if (editingExercise) {
      setExercises((prev) =>
        prev.map((e) =>
          e.id === editingExercise.id
            ? {
                ...e,
                question: question.trim(),
                lessonId,
                type,
                options: optionsArray,
                correctAnswer: correctAnswer.trim(),
                order: Number(order) || e.order,
              }
            : e
        )
      );
    } else {
      const newExercise: Exercise = {
        id: String(Date.now()),
        lessonId: lessonId.trim(),
        lessonName: "Lição " + lessonId,
        type,
        question: question.trim(),
        options: optionsArray,
        correctAnswer: correctAnswer.trim(),
        order: Number(order) || exercises.length + 1,
      };
      setExercises((prev) => [...prev, newExercise]);
    }

    setModalVisible(false);
  }

  // Badge visual do tipo de exercício
  function getTypeBadge(exerciseType: ExerciseType) {
    return exerciseType === "multiple_choice" ? "Múltipla Escolha" : "V ou F";
  }

  function renderExercise({ item }: { item: Exercise }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <View style={styles.badgeRow}>
            <Text style={styles.cardBadge}>{item.lessonName}</Text>
            <Text style={styles.typeBadge}>{getTypeBadge(item.type)}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.question}
          </Text>
          <Text style={styles.cardMeta}>
            Resposta: {item.correctAnswer} • Ordem: {item.order}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
            <Text style={styles.deleteBtnText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Text style={styles.addBtnText}>+ Novo Exercício</Text>
      </TouchableOpacity>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum exercício cadastrado.</Text>
        }
      />

      {/* Modal de criação/edição */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              {editingExercise ? "Editar Exercício" : "Novo Exercício"}
            </Text>

            {/* Seletor de tipo */}
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeBtn, type === "multiple_choice" && styles.typeBtnActive]}
                onPress={() => setType("multiple_choice")}
              >
                <Text style={[styles.typeBtnText, type === "multiple_choice" && styles.typeBtnTextActive]}>
                  Múltipla Escolha
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === "true_false" && styles.typeBtnActive]}
                onPress={() => setType("true_false")}
              >
                <Text style={[styles.typeBtnText, type === "true_false" && styles.typeBtnTextActive]}>
                  V ou F
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Pergunta</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={question}
              onChangeText={setQuestion}
              placeholder="Digite a pergunta"
              placeholderTextColor={Colors.textMuted}
              multiline
            />

            <Text style={styles.label}>ID da Lição</Text>
            <TextInput
              style={styles.input}
              value={lessonId}
              onChangeText={setLessonId}
              placeholder="Ex: 1"
              placeholderTextColor={Colors.textMuted}
            />

            {type === "multiple_choice" && (
              <>
                <Text style={styles.label}>Opções (separadas por vírgula)</Text>
                <TextInput
                  style={styles.input}
                  value={options}
                  onChangeText={setOptions}
                  placeholder="Opção A, Opção B, Opção C, Opção D"
                  placeholderTextColor={Colors.textMuted}
                />
              </>
            )}

            <Text style={styles.label}>Resposta Correta</Text>
            <TextInput
              style={styles.input}
              value={correctAnswer}
              onChangeText={setCorrectAnswer}
              placeholder={type === "true_false" ? "Verdadeiro ou Falso" : "Texto exato da opção correta"}
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Ordem</Text>
            <TextInput
              style={styles.input}
              value={order}
              onChangeText={setOrder}
              placeholder="1"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  addBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: "center", marginBottom: 16 },
  addBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
  list: { paddingBottom: 20 },
  card: { backgroundColor: Colors.surfaceDark, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardInfo: { marginBottom: 12 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  cardBadge: { color: Colors.primary, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  typeBadge: { color: Colors.warning, fontSize: 11, fontWeight: "700" },
  cardTitle: { color: Colors.white, fontSize: 15, fontWeight: "600" },
  cardMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 6 },
  cardActions: { flexDirection: "row", gap: 8 },
  editBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  editBtnText: { color: Colors.white, fontSize: 13, fontWeight: "600" },
  deleteBtn: { backgroundColor: Colors.error, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  deleteBtnText: { color: Colors.white, fontSize: 13, fontWeight: "600" },
  emptyText: { color: Colors.textMuted, textAlign: "center", marginTop: 40 },
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  modal: { backgroundColor: Colors.surfaceDark, borderRadius: 16, padding: 24, width: "100%", maxHeight: "90%" },
  modalTitle: { color: Colors.white, fontSize: 18, fontWeight: "700", marginBottom: 16 },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: "600", marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: "#0D1B3E", borderRadius: 8, padding: 12, color: Colors.white, fontSize: 14 },
  inputMultiline: { minHeight: 70, textAlignVertical: "top" },
  typeSelector: { flexDirection: "row", gap: 8 },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: "#0D1B3E" },
  typeBtnActive: { backgroundColor: Colors.primary },
  typeBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: "600" },
  typeBtnTextActive: { color: Colors.white },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 20 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  cancelBtnText: { color: Colors.textMuted, fontWeight: "600" },
  saveBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: Colors.white, fontWeight: "700" },
});
