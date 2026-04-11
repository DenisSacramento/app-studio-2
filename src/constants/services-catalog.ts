export type ServiceCatalogItem = {
  name: string;
  description: string;
  averageDurationMinutes: number;
  referenceNote: string;
};

const MARKET_REFERENCE_NOTE =
  'Média de mercado no Brasil com base em tabelas de salões e academias técnicas; pode variar por volume, comprimento e histórico químico.';

export const SERVICES_CATALOG: ServiceCatalogItem[] = [
  {
    name: 'Selagem',
    description:
      'Tratamento termoativado para reduzir frizz, alinhar a fibra e aumentar o brilho.',
    averageDurationMinutes: 120,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Progressiva sem formol',
    description:
      'Alinhamento térmico com ativos alternativos para reduzir volume sem formol livre.',
    averageDurationMinutes: 210,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Progressiva com formol',
    description:
      'Alisamento químico de alta fixação para controle intenso de frizz e volume.',
    averageDurationMinutes: 180,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Botox capilar',
    description:
      'Reposição de massa para reduzir porosidade, alinhar e disciplinar os fios.',
    averageDurationMinutes: 150,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Reconstrução hidronutrição',
    description:
      'Combinação de hidratação, nutrição e reconstrução para recuperar elasticidade.',
    averageDurationMinutes: 90,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Penteado',
    description:
      'Finalização para eventos com modelagem e fixação de acordo com o estilo desejado.',
    averageDurationMinutes: 75,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Pós-química',
    description:
      'Tratamento de reparação após química para estabilizar pH e reduzir danos.',
    averageDurationMinutes: 80,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Progressiva matizadora',
    description:
      'Progressiva com pigmentos para alinhar fios e neutralizar reflexos indesejados.',
    averageDurationMinutes: 210,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Coloração e pintura',
    description:
      'Aplicação de coloração global para cobertura de brancos ou mudança de tom.',
    averageDurationMinutes: 120,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Cristalização capilar',
    description:
      'Selagem de cutícula com foco em brilho intenso e toque mais macio.',
    averageDurationMinutes: 100,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Hidro reconstrução',
    description:
      'Reposição hídrica com reforço reconstrutor para fios fragilizados.',
    averageDurationMinutes: 90,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Corte',
    description:
      'Modelagem do corte conforme formato do rosto, caimento e objetivo da cliente.',
    averageDurationMinutes: 45,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Escova simples',
    description:
      'Escovação para alinhamento e finalização rápida no dia a dia.',
    averageDurationMinutes: 40,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Escova com hidratação',
    description:
      'Escova com etapa de hidratação para aumentar maciez e brilho dos fios.',
    averageDurationMinutes: 70,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Retoque de raiz progressiva',
    description:
      'Aplicação de progressiva apenas na raiz para manter alinhamento sem excesso.',
    averageDurationMinutes: 150,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Progressiva cabelos loiros',
    description:
      'Progressiva com técnica específica para loiros e fios sensibilizados.',
    averageDurationMinutes: 240,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Cronograma capilar',
    description:
      'Sequência de hidratação, nutrição e reconstrução para recuperação progressiva.',
    averageDurationMinutes: 90,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Hidratação',
    description:
      'Reposição de água para reduzir ressecamento e melhorar maleabilidade dos fios.',
    averageDurationMinutes: 60,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Lavar e secar',
    description:
      'Higienização completa e secagem para finalização prática e rápida.',
    averageDurationMinutes: 35,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
  {
    name: 'Luzes ou morena iluminada',
    description:
      'Técnica de mechas para iluminação personalizada em efeito natural ou marcado.',
    averageDurationMinutes: 240,
    referenceNote: MARKET_REFERENCE_NOTE,
  },
];
