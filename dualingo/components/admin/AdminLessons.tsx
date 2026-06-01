/**
 * AdminLessons — CRUD de lições.
 *
 * Permite criar, editar e excluir lições dentro de um módulo.
 * Cada lição pertence a um módulo específico (moduleId).
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

interface Lesson {
  id: string;
  moduleId: string;
  moduleName: string;
  name: string;
  description: string;
  order: number;
  xpReward: number;
}

// Dados iniciais para demonstração
const INITIAL_LESSONS: Lesson[] = [
  { id: "1", moduleId: "1", moduleName: "Fundamentos", name: "O que é React Native?", description: "Introdução ao framework", order: 1, xpReward: 10 },
  { id: "2", moduleId: "1", moduleName: "Fundamentos", name: "Configurando o ambiente", description: "Setup do Expo CLI", order: 2, xpReward: 10 },
  { id: "3", moduleId: "2", moduleName: "Componentes", name: "View e Text", description: "Componentes básicos de layout", order: 1, xpReward: 10 },
  { id: "4", moduleId: "4", moduleName: "Conceitos de Cloud", name: "O que é Cloud?", description: "Introdução à computação em nuvem", order: 1, xpReward: 10 },
];

export default function AdminLessons() {
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Campos do formulário
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [order, setOrder] = useState("");
  const [xpReward, setXpReward] = useState("10");

  function handleAdd() {
    setEditingLesson(null);
    setName("");
    setDescription("");
    setModuleId("");
    setOrder("");
    setXpReward("10");
    setModalVisible(true);
  }

  function handleEdit(lesson: Lesson) {
    setEditingLesson(lesson);
    setName(lesson.name);
    setDescription(lesson.description);
    setModuleId(lesson.moduleId);
    setOrder(String(lesson.order));
    setXpReward(String(lesson.xpReward));
    setModalVisible(true);
  }

  function handleDelete(lesson: Lesson) {
    const confirmed = typeof window !== "undefined"
      ? window.confirm(`Deseja excluir "${lesson.name}"? Os exercícios associados também serão removidos.`)
      : true;

    if (confirmed) {
      setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
    }
  }

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome da lição é obrigatório.");
      return;
    }
    if (!moduleId.trim()) {
      Alert.alert("Erro", "O ID do módulo é obrigatório.");
      return;
    }

    if (editingLesson) {
      setLessons((prev) =>
        prev.map((l) =>
          l.id === editingLesson.id
            ? {
                ...l,
                name: name.trim(),
                description: description.trim(),
                moduleId,
                order: Number(order) || l.order,
                xpReward: Number(xpReward) || 10,
              }
            : l
        )
      );
    } else {
      const newLesson: Lesson = {
        id: String(Date.now()),
        moduleId: moduleId.trim(),
        moduleName: "Módulo " + moduleId,
        name: name.trim(),
        description: description.trim(),
        order: Number(order) || lessons.length + 1,
        xpReward: Number(xpReward) || 10,
      };
      setLessons((prev) => [...prev, newLesson]);
    }

    setModalVisible(false);
  }

  function renderLesson({ item }: { item: Lesson }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardBadge}>{item.moduleName}</Text>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.cardMeta}>
            Ordem: {item.order} • XP: {item.xpReward}
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
        <Text style={styles.addBtnText}>+ Nova Lição</Text>
      </TouchableOpacity>

      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={renderLesson}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma lição cadastrada.</Text>
        }
      />

      {/* Modal de criação/edição */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              {editingLesson ? "Editar Lição" : "Nova Lição"}
            </Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome da lição"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descrição da lição"
              placeholderTextColor={Colors.textMuted}
              multiline
            />

            <Text style={styles.label}>ID do Módulo</Text>
            <TextInput
              style={styles.input}
              value={moduleId}
              onChangeText={setModuleId}
              placeholder="Ex: 1"
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

            <Text style={styles.label}>XP por conclusão</Text>
            <TextInput
              style={styles.input}
              value={xpReward}
              onChangeText={setXpReward}
              placeholder="10"
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
  cardBadge: { color: Colors.green, fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginBottom: 4 },
  cardTitle: { color: Colors.white, fontSize: 16, fontWeight: "700" },
  cardDescription: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  cardMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 6 },
  cardActions: { flexDirection: "row", gap: 8 },
  editBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  editBtnText: { color: Colors.white, fontSize: 13, fontWeight: "600" },
  deleteBtn: { backgroundColor: Colors.error, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  deleteBtnText: { color: Colors.white, fontSize: 13, fontWeight: "600" },
  emptyText: { color: Colors.textMuted, textAlign: "center", marginTop: 40 },
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  modal: { backgroundColor: Colors.surfaceDark, borderRadius: 16, padding: 24, width: "100%" },
  modalTitle: { color: Colors.white, fontSize: 18, fontWeight: "700", marginBottom: 16 },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: "600", marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: "#0D1B3E", borderRadius: 8, padding: 12, color: Colors.white, fontSize: 14 },
  inputMultiline: { minHeight: 70, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 20 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  cancelBtnText: { color: Colors.textMuted, fontWeight: "600" },
  saveBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: Colors.white, fontWeight: "700" },
});
