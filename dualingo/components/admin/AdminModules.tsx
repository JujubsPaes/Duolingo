/**
 * AdminModules — CRUD de módulos.
 *
 * Permite criar, editar e excluir módulos dentro de um curso.
 * Cada módulo pertence a um curso específico (courseId).
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

interface Module {
  id: string;
  courseId: string;
  courseName: string;
  name: string;
  description: string;
  order: number;
}

// Dados iniciais para demonstração
const INITIAL_MODULES: Module[] = [
  { id: "1", courseId: "1", courseName: "Expo", name: "Fundamentos", description: "Conceitos básicos do React Native e Expo", order: 1 },
  { id: "2", courseId: "1", courseName: "Expo", name: "Componentes", description: "Componentes nativos e customizados", order: 2 },
  { id: "3", courseId: "1", courseName: "Expo", name: "Navegação", description: "Expo Router e navegação entre telas", order: 3 },
  { id: "4", courseId: "2", courseName: "AWS", name: "Conceitos de Cloud", description: "Introdução à computação em nuvem", order: 1 },
  { id: "5", courseId: "2", courseName: "AWS", name: "IAM", description: "Gerenciamento de identidade e acesso", order: 2 },
  { id: "6", courseId: "2", courseName: "AWS", name: "S3", description: "Armazenamento de objetos na nuvem", order: 3 },
];

export default function AdminModules() {
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Campos do formulário
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [order, setOrder] = useState("");

  function handleAdd() {
    setEditingModule(null);
    setName("");
    setDescription("");
    setCourseId("");
    setOrder("");
    setModalVisible(true);
  }

  function handleEdit(mod: Module) {
    setEditingModule(mod);
    setName(mod.name);
    setDescription(mod.description);
    setCourseId(mod.courseId);
    setOrder(String(mod.order));
    setModalVisible(true);
  }

  function handleDelete(mod: Module) {
    const confirmed = typeof window !== "undefined"
      ? window.confirm(`Deseja excluir "${mod.name}"?`)
      : true;

    if (confirmed) {
      setModules((prev) => prev.filter((m) => m.id !== mod.id));
    }
  }

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome do módulo é obrigatório.");
      return;
    }
    if (!courseId.trim()) {
      Alert.alert("Erro", "O ID do curso é obrigatório.");
      return;
    }

    if (editingModule) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === editingModule.id
            ? { ...m, name: name.trim(), description: description.trim(), courseId, order: Number(order) || m.order }
            : m
        )
      );
    } else {
      const newModule: Module = {
        id: String(Date.now()),
        courseId: courseId.trim(),
        courseName: courseId === "1" ? "Expo" : "AWS",
        name: name.trim(),
        description: description.trim(),
        order: Number(order) || modules.length + 1,
      };
      setModules((prev) => [...prev, newModule]);
    }

    setModalVisible(false);
  }

  function renderModule({ item }: { item: Module }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardBadge}>{item.courseName}</Text>
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
      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Text style={styles.addBtnText}>+ Novo Módulo</Text>
      </TouchableOpacity>

      <FlatList
        data={modules}
        keyExtractor={(item) => item.id}
        renderItem={renderModule}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum módulo cadastrado.</Text>
        }
      />

      {/* Modal de criação/edição */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              {editingModule ? "Editar Módulo" : "Novo Módulo"}
            </Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome do módulo"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descrição do módulo"
              placeholderTextColor={Colors.textMuted}
              multiline
            />

            <Text style={styles.label}>ID do Curso</Text>
            <TextInput
              style={styles.input}
              value={courseId}
              onChangeText={setCourseId}
              placeholder="Ex: 1 (Expo) ou 2 (AWS)"
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
  cardBadge: { color: Colors.primary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginBottom: 4 },
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
