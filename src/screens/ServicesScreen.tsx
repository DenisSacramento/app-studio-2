import { SERVICES_CATALOG } from '@/src/constants/services-catalog';
import servicesService from '@/src/services/servicesService';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATALOG_DEFAULT_PRICE = 1;

type ServiceForm = {
  name: string;
  description: string;
  durationMinutes: string;
  isActive: boolean;
};

export default function ServicesScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [services, setServices] = useState<
    {
      id: string;
      name: string;
      description?: string | null;
      price: string;
      durationMinutes: number;
      isActive: boolean;
    }[]
  >([]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>({
    name: '',
    description: '',
    durationMinutes: '',
    isActive: true,
  });

  function resetForm() {
    setEditingServiceId(null);
    setForm({
      name: '',
      description: '',
      durationMinutes: '',
      isActive: true,
    });
  }

  function normalize(text: string) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  async function loadServices() {
    try {
      setIsLoading(true);
      const response = await servicesService.list();
      console.log('SERVICES RESPONSE:', response);
      console.log(
        'SERVICES COUNT:',
        Array.isArray(response.services) ? response.services.length : 'invalid'
      );

      setServices(Array.isArray(response.services) ? response.services : []);
    } catch (error: any) {
      console.error('SERVICES LOAD ERROR:', error);
      Alert.alert('Erro', error?.message ?? 'Falha ao carregar serviços');
    } finally {
      setIsLoading(false);
    }
  }

  function startEditing(service: {
    id: string;
    name: string;
    description?: string | null;
    price: string;
    durationMinutes: number;
    isActive: boolean;
  }) {
    setEditingServiceId(service.id);
    setForm({
      name: service.name,
      description: service.description ?? '',
      durationMinutes: String(service.durationMinutes),
      isActive: service.isActive,
    });
  }

  function validateForm(): string | null {
    if (!form.name.trim()) {
      return 'Informe o nome do serviço.';
    }

    const parsedDuration = Number(form.durationMinutes);
    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
      return 'Informe uma duração em minutos válida.';
    }

    return null;
  }

  async function saveService() {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validação', validationError);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: CATALOG_DEFAULT_PRICE,
        durationMinutes: Number(form.durationMinutes),
      };

      if (editingServiceId) {
        await servicesService.update(editingServiceId, {
          ...payload,
          isActive: form.isActive,
        });
      } else {
        await servicesService.create(payload);
      }

      resetForm();
      await loadServices();
      Alert.alert('Sucesso', editingServiceId ? 'Serviço atualizado com sucesso.' : 'Serviço criado com sucesso.');
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Falha ao salvar serviço');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteService(serviceId: string) {
    Alert.alert('Confirmação', 'Deseja remover este serviço?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsSaving(true);
            await servicesService.remove(serviceId);
            await loadServices();
            if (editingServiceId === serviceId) {
              resetForm();
            }
            Alert.alert('Sucesso', 'Serviço removido com sucesso.');
          } catch (error: any) {
            Alert.alert('Erro', error?.message ?? 'Falha ao remover serviço');
          } finally {
            setIsSaving(false);
          }
        },
      },
    ]);
  }

  async function loadDefaultCatalog() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const existingNames = new Set(services.map((item) => normalize(item.name)));
      const toCreate = SERVICES_CATALOG.filter((item) => !existingNames.has(normalize(item.name)));

      if (!toCreate.length) {
        Alert.alert('Catálogo', 'Todos os serviços padrão já estão cadastrados.');
        return;
      }

      for (const item of toCreate) {
        await servicesService.create({
          name: item.name,
          description: `${item.description} ${item.referenceNote}`,
          price: CATALOG_DEFAULT_PRICE,
          durationMinutes: item.averageDurationMinutes,
        });
      }

      await loadServices();
      Alert.alert('Catálogo', `${toCreate.length} serviços padrão adicionados.`);
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Falha ao adicionar catálogo padrão');
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#A91E63" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View pointerEvents="none" style={styles.backgroundDecor}>
        <View style={[styles.bgBlob, styles.bgBlobTop]} />
        <View style={[styles.bgBlob, styles.bgBlobMiddle]} />
        <View style={[styles.bgBlob, styles.bgBlobBottom]} />
      </View>

      <ScrollView contentContainerStyle={styles.pageContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Serviços</Text>
          <TouchableOpacity onPress={loadServices} style={styles.reloadButton}>
            <Text style={styles.reloadText}>Atualizar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{editingServiceId ? 'Editar serviço' : 'Novo serviço'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome do serviço"
            value={form.name}
            onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descrição do procedimento"
            multiline
            value={form.description}
            onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))}
          />

          <TextInput
            style={styles.input}
            placeholder="Duração (min)"
            keyboardType="number-pad"
            value={form.durationMinutes}
            onChangeText={(value) => setForm((prev) => ({ ...prev, durationMinutes: value }))}
          />

          {editingServiceId ? (
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Serviço ativo</Text>
              <Switch
                value={form.isActive}
                onValueChange={(value) => setForm((prev) => ({ ...prev, isActive: value }))}
              />
            </View>
          ) : null}

          <View style={styles.formActions}>
            <TouchableOpacity
              disabled={isSaving}
              style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
              onPress={saveService}
            >
              <Text style={styles.primaryButtonText}>{editingServiceId ? 'Salvar alterações' : 'Cadastrar serviço'}</Text>
            </TouchableOpacity>

            {editingServiceId ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={resetForm}>
                <Text style={styles.secondaryButtonText}>Cancelar edição</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.catalogCard}>
          <Text style={styles.catalogTitle}>Catálogo sugerido de procedimentos</Text>
          <Text style={styles.catalogSubtitle}>
            Inclui descrição breve e tempo médio de execução por procedimento.
          </Text>

          <TouchableOpacity
            style={[styles.catalogButton, isSaving && styles.buttonDisabled]}
            onPress={loadDefaultCatalog}
            disabled={isSaving}
          >
            <Text style={styles.catalogButtonText}>Adicionar catálogo padrão</Text>
          </TouchableOpacity>

          <View style={styles.catalogList}>
            {SERVICES_CATALOG.map((item) => (
              <View key={item.name} style={styles.catalogItem}>
                <Text style={styles.catalogItemTitle}>{item.name}</Text>
                <Text style={styles.catalogItemDescription}>{item.description}</Text>
                <Text style={styles.catalogItemMeta}>Tempo médio: {item.averageDurationMinutes} min</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.listTitle}>Serviços cadastrados</Text>
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum serviço cadastrado ainda.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={[styles.cardStatus, !item.isActive && styles.cardStatusInactive]}>
                  {item.isActive ? 'Ativo' : 'Inativo'}
                </Text>
              </View>

              {item.description ? <Text style={styles.cardDescription}>{item.description}</Text> : null}
              <Text style={styles.cardSubtitle}>{item.durationMinutes} min</Text>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => startEditing(item)}>
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteService(item.id)}>
                  <Text style={styles.deleteButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5edf7' },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.22,
  },
  bgBlobTop: {
    width: 320,
    height: 320,
    backgroundColor: '#f472b6',
    top: -120,
    right: -80,
  },
  bgBlobMiddle: {
    width: 300,
    height: 300,
    backgroundColor: '#c084fc',
    top: 220,
    left: -130,
  },
  bgBlobBottom: {
    width: 360,
    height: 360,
    backgroundColor: '#9d174d',
    bottom: -170,
    right: -120,
  },
  pageContent: { paddingBottom: 30 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#7a1d55' },
  reloadButton: { backgroundColor: '#a21caf', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  reloadText: { color: '#fff', fontWeight: '700' },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    color: '#333',
  },
  textArea: { minHeight: 84, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: { color: '#333', fontWeight: '600' },
  formActions: { gap: 8 },
  primaryButton: {
    backgroundColor: '#a21caf',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#a21caf',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: { color: '#8b1d5f', fontWeight: '700' },
  buttonDisabled: { opacity: 0.6 },
  catalogCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  catalogTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  catalogSubtitle: { color: '#666', marginTop: 6, marginBottom: 12 },
  catalogButton: {
    backgroundColor: '#a21caf',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  catalogButtonText: { color: '#fff', fontWeight: '700' },
  catalogList: { gap: 10 },
  catalogItem: {
    borderWidth: 1,
    borderColor: '#f3e8ff',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  catalogItemTitle: { color: '#333', fontWeight: '700' },
  catalogItemDescription: { color: '#666', marginTop: 4 },
  catalogItemMeta: { color: '#8b1d5f', marginTop: 6, fontWeight: '600' },
  listTitle: { marginHorizontal: 20, marginBottom: 8, fontSize: 18, fontWeight: '700', color: '#333' },
  listContent: { padding: 20, gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  cardDescription: { color: '#555', marginBottom: 8 },
  cardSubtitle: { marginTop: 6, color: '#666' },
  cardStatus: { color: '#8b1d5f', fontWeight: '700', fontSize: 12 },
  cardStatusInactive: { color: '#999' },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  editButton: {
    backgroundColor: '#a21caf',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  editButtonText: { color: '#fff', fontWeight: '700' },
  deleteButton: {
    backgroundColor: '#fff0f1',
    borderWidth: 1,
    borderColor: '#d9534f',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  deleteButtonText: { color: '#d9534f', fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 40 },
});
