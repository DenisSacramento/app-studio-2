import { SERVICES_CATALOG } from '@/src/constants/services-catalog';
import servicesService, { ServiceItem } from '@/src/services/servicesService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export type Service = ServiceItem;
const CATALOG_DEFAULT_PRICE = 1;

export default function AdminServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(null);

  function normalize(text: string) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setIsLoading(true);
      const response = await servicesService.list();
      const currentServices = response.services || [];

      // Garante que o catálogo oficial exista no backend para manter admin e cliente sincronizados.
      const byName = new Map(currentServices.map((item) => [normalize(item.name), item]));
      const missingCatalog = SERVICES_CATALOG.filter((item) => !byName.has(normalize(item.name)));

      if (missingCatalog.length) {
        for (const item of missingCatalog) {
          await servicesService.create({
            name: item.name,
            description: `${item.description} ${item.referenceNote}`,
            price: CATALOG_DEFAULT_PRICE,
            durationMinutes: item.averageDurationMinutes,
          });
        }
      }

      const refreshed = missingCatalog.length ? await servicesService.list() : { services: currentServices };
      const refreshedByName = new Map((refreshed.services || []).map((item) => [normalize(item.name), item]));

      const orderedCatalogServices: ServiceItem[] = SERVICES_CATALOG.reduce<ServiceItem[]>((acc, catalogItem) => {
        const existing = refreshedByName.get(normalize(catalogItem.name));
        if (!existing) {
          return acc;
        }

        acc.push({
          ...existing,
          name: catalogItem.name,
          description: catalogItem.description,
          durationMinutes: catalogItem.averageDurationMinutes,
        });

        return acc;
      }, []);

      setServices(orderedCatalogServices);
    } catch (error) {
      console.error('❌ Erro ao carregar serviços:', error);
      Alert.alert('Erro', 'Não foi possível carregar os serviços.');
    } finally {
      setIsLoading(false);
    }
  }

  function formatPrice(value: string) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return '0,00';
    }

    return parsed.toFixed(2).replace('.', ',');
  }

  async function toggleServiceAvailability(service: Service) {
    try {
      setUpdatingServiceId(service.id);
      await servicesService.update(service.id, { isActive: !service.isActive });

      setServices((prev) =>
        prev.map((item) =>
          item.id === service.id ? { ...item, isActive: !item.isActive } : item
        )
      );
    } catch (error) {
      console.error('❌ Erro ao atualizar disponibilidade:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a disponibilidade do serviço.');
    } finally {
      setUpdatingServiceId(null);
    }
  }

  return (
    <View style={styles.container}>
      {/* Background decorativo */}
      <View style={[styles.bgBlob, styles.bgBlobTop]} />
      <View style={[styles.bgBlob, styles.bgBlobMiddle]} />
      <View style={[styles.bgBlob, styles.bgBlobBottom]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#7a1d55" />
        </TouchableOpacity>
        <Text style={styles.title}>Serviços</Text>
        <TouchableOpacity style={styles.addButton} onPress={loadServices}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.syncNote}>Catálogo sincronizado com os serviços exibidos no painel do cliente</Text>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#a21caf" />
          </View>
        ) : services.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="cut" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Nenhum serviço do catálogo foi encontrado</Text>
          </View>
        ) : (
          <View style={styles.servicesList}>
            {services.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceIcon}>
                  <Ionicons name="cut" size={24} color="#a21caf" />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  {service.description && (
                    <Text numberOfLines={1} style={styles.serviceDescription}>
                      {service.description}
                    </Text>
                  )}
                  <View style={styles.serviceDetails}>
                    <Text style={styles.detailText}>
                      ⏱️ Tempo médio: {service.durationMinutes} min
                    </Text>
                    <Text style={styles.detailText}>
                      💰 R$ {formatPrice(service.price)}
                    </Text>
                  </View>
                </View>
                <View style={styles.serviceStatus}>
                  <Text
                    style={[
                      styles.statusLabel,
                      service.isActive ? styles.statusActive : styles.statusInactive,
                    ]}
                  >
                    {service.isActive ? 'Disponível' : 'Indisponível'}
                  </Text>
                  <Switch
                    value={service.isActive}
                    onValueChange={() => toggleServiceAvailability(service)}
                    disabled={updatingServiceId === service.id}
                    trackColor={{ false: '#fca5a5', true: '#86efac' }}
                    thumbColor={service.isActive ? '#16a34a' : '#dc2626'}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5edf7',
  },
  scrollView: {
    flex: 1,
  },
  syncNote: {
    fontSize: 12,
    color: '#8b1d5f',
    marginHorizontal: 20,
    marginBottom: 8,
    textAlign: 'center',
    zIndex: 10,
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.22,
  },
  bgBlobTop: {
    width: 400,
    height: 400,
    top: -100,
    right: -100,
    backgroundColor: '#ffc0cb',
  },
  bgBlobMiddle: {
    width: 300,
    height: 300,
    top: '30%',
    left: -50,
    backgroundColor: '#da70d6',
  },
  bgBlobBottom: {
    width: 350,
    height: 350,
    bottom: -50,
    right: 50,
    backgroundColor: '#c91585',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7a1d55',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a21caf',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  servicesList: {
    paddingHorizontal: 10,
    zIndex: 10,
  },
  serviceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f5edf7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7a1d55',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  detailText: {
    fontSize: 11,
    color: '#6b7280',
  },
  serviceStatus: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusActive: {
    color: '#15803d',
  },
  statusInactive: {
    color: '#b91c1c',
  },
  footer: {
    height: 40,
  },
});
