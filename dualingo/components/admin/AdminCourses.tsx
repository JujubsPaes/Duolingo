/**
 * AdminCourses — CRUD de cursos.
 *
 * Permite criar, editar e excluir cursos da plataforma.
 * Os dados são gerenciados localmente (mock) até a integração com o backend.
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

interface Course {
  id: string;
  name: string;
  description: string;
  order: number;
}

// Dados iniciais para demonstração
const INITIAL_COURSES: Course[] = [
  { id: "1", name: "Expo (React Native)", description: "Aprenda a criar apps mobile com Expo e React Native", order: 1 },
  { id: "2", name: "AWS Nuvem", description: "Domine os serviços de cloud computing da Amazon", order: 2 },
];

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Campos do formulário
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");

  // Abre o modal para criar um novo curso
  function handleAdd() {
    setEditingCourse(null);
    setName("");
    setDescription("");
    setOrder(String(courses.length + 1));
    setModalVisible(true);
  }

  // Abre o modal para editar um curso existente
  function handleEdit(course: Course) {
    setEditingCourse(course);
    setName(course.name);
    setDescription(course.description);
    setOrder(String(course.order));
    setModalVisible(true);
  }

  // Exclui um curso com confirmação
  function handleDelete(course: Course) {
    // Alert.alert com botões não funciona na web, então usa confirm nativo
    const confirmed = typeof window !== "undefined"
      ? window.confirm(`Deseja excluir "${course.name}"? O progresso dos alunos será preservado.`)
      : true;

    if (confirmed) {
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    }
  }

  // Salva (cria ou atualiza) o curso
  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome do curso é obrigatório.");
      return;
    }

    if (editingCourse) {
      // Atualiza curso existente
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourse.id
            ? { ...c, name: name.trim(), description: description.trim(), order: Number(order) || c.order }
            : c
        )
      );
    } else {
      // Cria novo curso
      const newCourse: Course = {
        id: String(Date.now()),
        name: name.trim(),
        description: description.trim(),
        order: Number(order) || courses.length + 1,
      };
      setCourses((prev) => [...prev, newCourse]);
    }

    setModalVisible(false);
  }

  // Renderiza cada item da lista
  function renderCourse({ item }: { item: Course }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.cardMeta}>Ordem: {item.order}</Text>
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
      {/* Botão de adicionar */}
      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Text style={styles.addBtnText}>+ Novo Curso</Text>
      </TouchableOpacity>

      {/* Lista de cursos */}
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={renderCourse}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum curso cadastrado.</Text>
        }
      />

      {/* Modal de criação/edição */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              {editingCourse ? "Editar Curso" : "Novo Curso"}
            </Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome do curso"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descrição do curso"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
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
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
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
  addBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  addBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardInfo: { marginBottom: 12 },
  cardTitle: { color: Colors.white, fontSize: 16, fontWeight: "700" },
  cardDescription: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  cardMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 6 },
  cardActions: { flexDirection: "row", gap: 8 },
  editBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editBtnText: { color: Colors.white, fontSize: 13, fontWeight: "600" },
  deleteBtn: {
    backgroundColor: Colors.error,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteBtnText: { color: Colors.white, fontSize: 13, fontWeight: "600" },
  emptyText: { color: Colors.textMuted, textAlign: "center", marginTop: 40 },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    padding: 24,
    width: "100%",
  },
  modalTitle: { color: Colors.white, fontSize: 18, fontWeight: "700", marginBottom: 16 },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: "600", marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: "#0D1B3E",
    borderRadius: 8,
    padding: 12,
    color: Colors.white,
    fontSize: 14,
  },
  inputMultiline: { minHeight: 70, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 20 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  cancelBtnText: { color: Colors.textMuted, fontWeight: "600" },
  saveBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveBtnText: { color: Colors.white, fontWeight: "700" },
});
