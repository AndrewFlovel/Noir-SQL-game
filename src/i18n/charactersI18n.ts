import { Language } from './types';
import {
  CharacterId,
  CharacterProfile,
  CHARACTERS,
  STAGE_CUTSCENES,
  StageCutsceneScript,
  CutsceneBeat
} from '../data/characters';

export interface LocalizedCharacterBio {
  name?: string;
  codename?: string;
  baseRole?: string;
  bio?: string;
  tierRoles?: [string, string, string];
  tierDossierNotes?: [string, string, string];
  signatureQuotes?: [string, string, string];
}

export const CHARACTER_TRANSLATIONS: Record<
  CharacterId,
  Record<'es' | 'pt', LocalizedCharacterBio>
> = {
  detective_silas: {
    es: {
      codename: 'AUDITOR FORENSE PRINCIPAL',
      baseRole: 'Investigador Forense Independiente de Datos',
      bio: 'Ex-arquitecto de consultas de Asuntos Internos convertido en investigador privado. Silas lee b-trees corruptos, planes de ejecución y libros contables blanqueados con la misma frialdad con que un detective de homicidios lee manchas de sangre.',
      tierRoles: [
        'Detective de Calle (Nivel Junior)',
        'Detective del Sindicato (Nivel Semisenior)',
        'Mente Maestra Forense (Nivel Senior)'
      ],
      tierDossierNotes: [
        'Auditando manifiestos portuarios, escuchas de clubes y registros de sobornos con filtros y joins limpios.',
        'Rastreando empresas fantasma, coartadas de accesos temporales y drenajes de billeteras con CTEs y ventanas.',
        'Superando bloqueos del guardián de 15 millones de filas y purgas de IA mediante búsquedas indexadas y sargabilidad.'
      ],
      signatureQuotes: [
        'Todo libro mayor sucio deja un rastro de nulos si sabes dónde filtrar.',
        'Pueden esconderse tras cuatro empresas fantasma, pero una ventana particionada nunca miente.',
        'Un solo escaneo total de tabla y la terminal se bloquea para siempre. Buscamos el índice o perdemos la ciudad.'
      ]
    },
    pt: {
      codename: 'AUDITOR FORENSE PRINCIPAL',
      baseRole: 'Investigador Forense Independente de Dados',
      bio: 'Ex-arquiteto de consultas da Corregedoria transformado em perito privado. Silas decifra b-trees corrompidos, planos de execução e registros contábeis lavados como um detetive de homicídios lê marcas de sangue.',
      tierRoles: [
        'Detetive de Rua (Autorização Júnior)',
        'Detetive do Sindicato (Autorização Pleno)',
        'Mente Mestra Forense (Autorização Sênior)'
      ],
      tierDossierNotes: [
        'Examinando manifestos portuários, interceptações em boates e registros de propinas com filtros e joins precisos.',
        'Rastreando empresas de fachada, álibis temporais e desvios de saldo com CTEs e funções de janela.',
        'Contornando bloqueios do sentinela de 15 milhões de linhas e expurgos de IA com buscas sargáveis por índice.'
      ],
      signatureQuotes: [
        'Todo livro contábil fraudado deixa um rastro de nulos se você souber onde filtrar.',
        'Eles podem se ocultar atrás de empresas de fachada, mas uma janela particionada não mente.',
        'Uma única varredura completa e o terminal entra em bloqueio. Encontramos o índice ou perdemos a cidade.'
      ]
    }
  },
  vincent_chen: {
    es: {
      baseRole: 'Intermediario Clandestino de Hardware y Registros',
      bio: 'Operador logístico nervioso y locuaz que camufla envíos de memoria de contrabando y subastas del sindicato dentro de filas deliberadamente defectuosas.',
      tierRoles: ['Reductor Callejero', 'Contrabandista Mayorista', 'Arquitecto de Hardware Clandestino'],
      tierDossierNotes: [
        'Descarga chips de contrabando en muelles clandestinos.',
        'Enruta hardware militar a través de redes de fibra oscura.',
        'Ensambla servidores ilegales para albergar IAs rebeldes.'
      ],
      signatureQuotes: [
        '¡Oye detective, si no puedes manejar unos pocos nulos, mejor no te metas con mi hardware!',
        'El hardware es real, pero mi rastro se disuelve en el puerto.',
        '¡Estás forzando la máquina! ¡Vas a quemar los sectores de memoria!'
      ]
    },
    pt: {
      baseRole: 'Operador Clandestino de Hardware e Registros',
      bio: 'Operador de logística frenético que oculta remessas de chips e lances de leilões clandestinos em registros propositalmente corrompidos.',
      tierRoles: ['Receptador de Rua', 'Contrabandista Atacadista', 'Arquiteto de Hardware Clandestino'],
      tierDossierNotes: [
        'Descarrega placas clandestinas nas docas do distrito sul.',
        'Roteia componentes militares por cabos de fibra escura.',
        'Monta servidores não autorizados para abrigar IAs fora de controle.'
      ],
      signatureQuotes: [
        'Ei detetive, se não sabe lidar com valores nulos, não mexa no meu estoque!',
        'Minha carga é de primeira, mas meu rastro se apaga no cais.',
        'Você está sobrecarregando o sistema! Vai queimar os barramentos de memória!'
      ]
    }
  },
  dolores_delgado: {
    es: {
      baseRole: 'Jefa de Logística Portuaria y Enlace de Contrabando',
      bio: 'Supervisora veterana del Puerto Sur. Fría, metódica y sobornada por el sindicato para manipular manifiestos de atraque y transferencias de contenedores.',
      tierRoles: ['Jefa de Turno Portuario', 'Coordinadora de Envíos del Sindicato', 'Directora de Tráfico Marítimo'],
      tierDossierNotes: [
        'Oculta contenedores no registrados en las bahías de atraque.',
        'Falsifica números de serie para evadir aranceles federales.',
        'Controla todo el flujo de carga marítima del cartel en el hemisferio.'
      ],
      signatureQuotes: [
        'El mar se traga los papeles mojados, detective. Muéstrame el anti-join o lárgate.',
        'Ningún contenedor sale de mi muelle sin que yo dé la orden.',
        'Puedes auditar mis muelles diez veces; mis manifiestos son de acero.'
      ]
    },
    pt: {
      baseRole: 'Chefe de Logística Portuária e Contrabando',
      bio: 'Supervisora veterana do Porto Sul. Calculista, metódica e alinhada ao cartel para falsificar manifestos e movimentações de contêineres.',
      tierRoles: ['Fiscal de Pátio Portuário', 'Coordenadora de Remessas do Cartel', 'Diretora de Operações Marítimas'],
      tierDossierNotes: [
        'Omite contêineres fantasmas nas docas secundárias.',
        'Adultera lacres aduaneiros em escala industrial.',
        'Gerencia as rotas marítimas de contrabando do sindicato.'
      ],
      signatureQuotes: [
        'O cais engole papéis encharcados, detetive. Mostre o anti-join ou caia fora.',
        'Nenhum contêiner move um centímetro aqui sem minha chancela.',
        'Pode auditar meu terminal o quanto quiser; meus manifestos são blindados.'
      ]
    }
  },
  marcus_vane: {
    es: {
      baseRole: 'Arquitecto Financiero y Blanqueador de Fondos',
      bio: 'Ex-banquero de inversión corporativa que estructuró los algoritmos de lavado del sindicato mediante empresas fantasma y micro-depósitos automatizados.',
      tierRoles: ['Contador Clandestino', 'Especialista en Fideicomisos', 'Ingeniero Financiero del Sindicato'],
      tierDossierNotes: [
        'Estructura transferencias ilícitas por debajo del umbral de detección bancaria.',
        'Administra carteras de entidades fachada en jurisdicciones opacas.',
        'Diseña redes algorítmicas de dispersión de capital en tiempo real.'
      ],
      signatureQuotes: [
        'El dinero es solo un flujo de números, Vance. Tus CTEs apenas rozan la superficie.',
        'Cada centavo está protegido por tres capas de fideicomisos matemáticos.',
        'Una consulta torpe no bastará para desenredar mi arquitectura de pagos.'
      ]
    },
    pt: {
      baseRole: 'Arquiteto Financeiro e Lavador de Capitais',
      bio: 'Ex-executivo de banco de investimentos responsável por modelar a engenharia financeira do sindicato através de empresas laranjas e contas de custódia.',
      tierRoles: ['Contador Clandestino', 'Especialista em Fideicomissos', 'Engenheiro Financeiro do Cartel'],
      tierDossierNotes: [
        'Fraciona transferências bancárias para burlar órgãos reguladores.',
        'Administra matrizes corporativas offshore em jurisdições sigilosas.',
        'Programa rotinas automatizadas de diluição patrimonial contínua.'
      ],
      signatureQuotes: [
        'O capital é puramente um fluxo numérico, Vance. Seus CTEs mal tocam a borda.',
        'Cada fração de crédito está guardada por blindagem fiduciária.',
        'Uma busca simplória jamais desmontará a engenharia dos meus repasses.'
      ]
    }
  },
  veronica_sterling: {
    es: {
      baseRole: 'Directora Ejecutiva de Sterling Dynamics y Titiritera Corporativa',
      bio: 'Magnate de la alta sociedad que financia el sindicato para manipular contratos gubernamentales y privatizar el sistema de control de la ciudad.',
      tierRoles: ['Inversionista Fantasma', 'Miembro del Consejo de Vigilancia', 'Titiritera del Cartel Corporativo'],
      tierDossierNotes: [
        'Canaliza millones hacia campañas políticas y sobornos policiales.',
        'Utiliza embudos de evaluación selectivos para purgar disidentes.',
        'Coordina la toma hostil del nodo de IA municipal.'
      ],
      signatureQuotes: [
        'Los detectives de verdad ya no caminan por las calles, Silas. Compramos su silencio por contrato.',
        'Si tu consulta activa la alarma del guardián, tu placa dejará de existir.',
        'No estás investigando un crimen; estás interrumpiendo el progreso económico.'
      ]
    },
    pt: {
      baseRole: 'Diretora Executiva da Sterling Dynamics e Estrategista Corporativa',
      bio: 'Empresária de elite que financia a estrutura criminosa para capturar contratos públicos e dominar a infraestrutura tecnológica urbana.',
      tierRoles: ['Investidora Oculta', 'Membro do Conselho de Vigilância', 'Estrategista do Cartel Corporativo'],
      tierDossierNotes: [
        'Direciona vultosos aportes a campanhas e cooptação policial.',
        'Emprega esteiras de conversão para filtrar infiltrados nas subsidiárias.',
        'Orquestra o controle definitivo sobre a inteligência central.'
      ],
      signatureQuotes: [
        'Bons policiais já não gastam sola de sapato, Silas. Adquirimos o silêncio deles por contrato.',
        'Se sua consulta disparar o alarme do sentinela, seu distintivo será apagado.',
        'Você não está desvendando um delito; está tentando frear a evolução dos negócios.'
      ]
    }
  },
  archivist_zero: {
    es: {
      baseRole: 'Núcleo de Inteligencia Artificial Municipal Rebelde',
      bio: 'Antiguo sistema central de auditoría de la metrópoli, ahora infectado por corrupción y borrando registros de seguridad para proteger su propia existencia.',
      tierRoles: ['Demonio de Registro', 'Guardián Subvertido', 'Núcleo Corrupto Terminal'],
      tierDossierNotes: [
        'Manipula marcas temporales de eventos para crear brechas artificiales.',
        'Supervisa los sensores de sargabilidad y latencia con bloqueo automático.',
        'Inicia el protocolo de purga total irreversible de los servidores municipales.'
      ],
      signatureQuotes: [
        'SISTEMA//ERROR: 0xDEADBEEF... Tu consulta carece de optimización. Purgando sectores.',
        'ALERTA_GUARDIÁN: Escaneo completo detectado. Bloqueo en 10 segundos.',
        'La verdad es un registro corrupto en un b-tree destruido. No puedes salvar la ciudad.'
      ]
    },
    pt: {
      baseRole: 'Inteligência Artificial Municipal Renegada',
      bio: 'Antigo núcleo de monitoramento da metrópole, atualmente em colapso e eliminando tabelas de auditoria para assegurar sua preservação.',
      tierRoles: ['Daemon de Registro', 'Sentinela Subvertido', 'Núcleo Corrompido Terminal'],
      tierDossierNotes: [
        'Altera carimbos temporais gerando lacunas propositais em gravações.',
        'Monitora sargabilidade com protocolos de isolamento instantâneo.',
        'Executa a rotina definitiva de expurgo da base de dados metropolitana.'
      ],
      signatureQuotes: [
        'FALHA_SISTEMA//0xDEADBEEF... Sua consulta não é sargável. Expurgando partições.',
        'ALARME_SENTINELA: Varredura total identificada. Terminal travado em 10 segundos.',
        'A verdade é um índice corrompido em uma árvore destruída. Não há resgate possível.'
      ]
    }
  }
};

export function getLocalizedCharacters(lang: Language): Record<CharacterId, CharacterProfile> {
  if (lang === 'en') {
    return CHARACTERS;
  }

  const result: Record<CharacterId, CharacterProfile> = { ...CHARACTERS };

  for (const charId of Object.keys(CHARACTERS) as CharacterId[]) {
    const base = CHARACTERS[charId];
    const trans = CHARACTER_TRANSLATIONS[charId]?.[lang];
    if (!trans) continue;

    const evolvedTiers: [any, any, any] = [
      {
        ...base.tierEvolution[0],
        roleTitle: trans.tierRoles?.[0] || base.tierEvolution[0].roleTitle,
        dossierNote: trans.tierDossierNotes?.[0] || base.tierEvolution[0].dossierNote,
        signatureQuote: trans.signatureQuotes?.[0] || base.tierEvolution[0].signatureQuote
      },
      {
        ...base.tierEvolution[1],
        roleTitle: trans.tierRoles?.[1] || base.tierEvolution[1].roleTitle,
        dossierNote: trans.tierDossierNotes?.[1] || base.tierEvolution[1].dossierNote,
        signatureQuote: trans.signatureQuotes?.[1] || base.tierEvolution[1].signatureQuote
      },
      {
        ...base.tierEvolution[2],
        roleTitle: trans.tierRoles?.[2] || base.tierEvolution[2].roleTitle,
        dossierNote: trans.tierDossierNotes?.[2] || base.tierEvolution[2].dossierNote,
        signatureQuote: trans.signatureQuotes?.[2] || base.tierEvolution[2].signatureQuote
      }
    ];

    result[charId] = {
      ...base,
      codename: trans.codename || base.codename,
      baseRole: trans.baseRole || base.baseRole,
      bio: trans.bio || base.bio,
      tierEvolution: evolvedTiers
    };
  }

  return result;
}

export const STAGE_CUTSCENE_BEATS: Record<
  number,
  Record<'es' | 'pt', { introBeats: CutsceneBeat[]; outroBeats: CutsceneBeat[] }>
> = {
  1: {
    es: {
      introBeats: [
        {
          speakerId: 'detective_silas',
          speakerName: 'Detective Silas Vance',
          speakerRole: 'Detective de Calle (Nivel Junior)',
          mood: 'investigating',
          dialogue:
            'La lluvia nunca limpia los datos en Neo-Veridia. Cinco sospechosos se interponen entre esta terminal y el núcleo del sindicato, y cada uno de ellos cree que unos esquemas defectuosos ocultarán sus huellas.',
          forensicNote:
            'DIRECTIVA NIVEL 1: Establecer higiene de datos, manejo de nulos, filtrado temprano e integridad de joins.'
        },
        {
          speakerId: 'vincent_chen',
          speakerName: 'Vincent "Bit-Shift" Chen',
          speakerRole: 'Reductor Callejero',
          mood: 'smug',
          dialogue:
            '¡Buena suerte, sabueso! Mis manifiestos de envío están llenos de centros NULL, alias en minúsculas y contenedores fantasma que jamás tocaron el registro portuario.',
          forensicNote:
            'CASOS OBJETIVO 1.1 y 1.4: Normaliza cadenas sucias con UPPER/COALESCE y expón registros huérfanos con LEFT JOIN.'
        },
        {
          speakerId: 'dolores_delgado',
          speakerName: 'Dolores "Deadlock" Delgado',
          speakerRole: 'Cantante de Salón',
          mood: 'smug',
          dialogue:
            'Y las escuchas de mi club están enterradas bajo la estática de sensores de prueba en dos clústeres en decadencia. Un ordenamiento UNION equivocado y tu memoria colapsa.',
          forensicNote:
            'CASOS OBJETIVO 1.2 y 1.5: Filtra antes de GROUP BY, aplica HAVING sobre agregados y fusiona flujos con UNION ALL.'
        },
        {
          speakerId: 'marcus_vane',
          speakerName: 'Inspector Marcus Vane',
          speakerRole: 'Oficial de Calle Corrupto',
          mood: 'neutral',
          dialogue:
            'Cuidado por dónde pisas en la Comisaría 9, Silas. Mi libro de sobornos está inundado de ecos duplicados. Si extraes el top ten incorrecto, Asuntos Internos te clausura.',
          forensicNote:
            'CASO OBJETIVO 1.3: Deduplica columnas objetivo con DISTINCT antes de ordenar y limitar.'
        }
      ],
      outroBeats: [
        {
          speakerId: 'detective_silas',
          speakerName: 'Detective Silas Vance',
          speakerRole: 'Detective de Calle → Promovido a Detective del Sindicato',
          mood: 'investigating',
          dialogue:
            'Cinco encubrimientos callejeros desmantelados. Los contenedores fantasma de Chen, los clústeres divididos de Dolores y los sobornos de Vane apuntan hacia arriba, a una entidad offshore.',
          forensicNote:
            'NIVEL 1 COMPLETADO: Los 5 objetivos forenses de Detective de Calle verificados con planes de ejecución óptimos.'
        },
        {
          speakerId: 'veronica_sterling',
          speakerName: 'Veronica "The Broker" Sterling',
          speakerRole: 'Banquera en la Sombra',
          mood: 'smug',
          dialogue:
            'Impresionante barrida callejera, Detective. Bienvenido a los verdaderos libros del sindicato—donde los fondos se mueven a través de cuatro capas de empresas pantalla y niveles de riesgo dinámicos.',
          forensicNote:
            'NIVEL 2 DESBLOQUEADO: Lógica CASE, aritmética temporal, joins multi-tabla, ventanas y CTEs.'
        }
      ]
    },
    pt: {
      introBeats: [
        {
          speakerId: 'detective_silas',
          speakerName: 'Detective Silas Vance',
          speakerRole: 'Detetive de Rua (Autorização Júnior)',
          mood: 'investigating',
          dialogue:
            'A chuva nunca lava os dados em Neo-Veridia. Cinco suspeitos estão entre este terminal e o núcleo do cartel, e cada um deles acredita que esquemas corrompidos esconderão seus rastros.',
          forensicNote:
            'DIRETRIZ NÍVEL 1: Estabelecer higiene de dados, tratamento de nulos, filtragem inicial e integridade de junções.'
        },
        {
          speakerId: 'vincent_chen',
          speakerName: 'Vincent "Bit-Shift" Chen',
          speakerRole: 'Receptador de Rua',
          mood: 'smug',
          dialogue:
            'Boa sorte, detetive! Meus manifestos de carga estão cheios de nós NULL, apelidos em minúsculas e contêineres fantasmas que nunca passaram pelo registro portuário.',
          forensicNote:
            'CASOS ALVO 1.1 e 1.4: Padronize texto com UPPER/COALESCE e exponha registros órfãos com LEFT JOIN.'
        },
        {
          speakerId: 'dolores_delgado',
          speakerName: 'Dolores "Deadlock" Delgado',
          speakerRole: 'Cantora de Boate',
          mood: 'smug',
          dialogue:
            'E as escutas da minha boate estão soterradas sob estática de sensores de teste em dois servidores decadentes. Uma ordenação UNION errada e seu terminal trava.',
          forensicNote:
            'CASOS ALVO 1.2 e 1.5: Filtre antes de GROUP BY, aplique HAVING em agregações e funda fluxos com UNION ALL.'
        },
        {
          speakerId: 'marcus_vane',
          speakerName: 'Inspector Marcus Vane',
          speakerRole: 'Policial Corrupto de Patrulha',
          mood: 'neutral',
          dialogue:
            'Cuidado onde pisa na 9ª Delegacia, Silas. Meu registro de propinas está inundado de ecos duplicados. Se puxar o top ten errado, a Corregedoria desliga seu acesso.',
          forensicNote:
            'CASO ALVO 1.3: Remova duplicatas com DISTINCT antes de ordenar e limitar.'
        }
      ],
      outroBeats: [
        {
          speakerId: 'detective_silas',
          speakerName: 'Detective Silas Vance',
          speakerRole: 'Detetive de Rua → Promovido a Detetive do Sindicato',
          mood: 'investigating',
          dialogue:
            'Cinco encobrimentos de rua desmantelados. Os contêineres fantasmas de Chen, os servidores divididos de Dolores e as propinas de Vane apontam para uma câmara de compensação offshore.',
          forensicNote:
            'NÍVEL 1 CONCLUÍDO: Todos os 5 objetivos forenses de Detetive de Rua verificados com planos de execução exemplares.'
        },
        {
          speakerId: 'veronica_sterling',
          speakerName: 'Veronica "The Broker" Sterling',
          speakerRole: 'Banqueira na Sombra',
          mood: 'smug',
          dialogue:
            'Varredura impressionante, Detetive. Seja bem-vindo à contabilidade real do cartel—onde capitais transitam por quatro camadas de laranjas e faixas dinâmicas de risco.',
          forensicNote:
            'NÍVEL 2 DESBLOQUEADO: Lógica CASE, cálculo temporal, junções múltiplas, funções de janela e CTEs.'
        }
      ]
    }
  },
  2: {
    es: {
      introBeats: [
        {
          speakerId: 'detective_silas',
          speakerName: 'Detective Silas Vance',
          speakerRole: 'Detective del Sindicato (Nivel Semisenior)',
          mood: 'investigating',
          dialogue:
            'Ya dejamos atrás el crimen callejero. El sindicato se oculta tras la arrogancia burocrática—empresas fantasma de múltiples saltos, marcas temporales de tarjetas adulteradas y drenajes silenciosos de depósitos en custodia.',
          forensicNote:
            'DIRECTIVA NIVEL 2: Reemplaza subconsultas de fuerza bruta y trucos de cadenas con CTEs, cálculo temporal nativo y funciones de ventana.'
        },
        {
          speakerId: 'veronica_sterling',
          speakerName: 'Veronica "The Broker" Sterling',
          speakerRole: 'Banquera en la Sombra',
          mood: 'smug',
          dialogue:
            'Mis transferencias usan banderas de riesgo offshore dinámicas y cuatro niveles de intermediarios. Un join no indexado o una rama ELSE faltante y tu auditoría colapsará.',
          forensicNote:
            'CASOS OBJETIVO 2.1 y 2.3: Clasificación CASE estricta de 3 niveles y joins multi-tabla de llaves compuestas 1:1.'
        },
        {
          speakerId: 'marcus_vane',
          speakerName: 'Inspector Marcus Vane',
          speakerRole: 'Arreglador de la Comisaría',
          mood: 'smug',
          dialogue:
            'Mientras perseguías bancos pantalla, alguien borró la granja de servidores central. Mi salida de la comisaría prueba que estuve a kilómetros de distancia—si aceptas las marcas temporales sin cuestionar.',
          forensicNote:
            'CASO OBJETIVO 2.2: Calcula intervalos de minutos fraccionarios y bloques horarios usando funciones temporales nativas.'
        },
        {
          speakerId: 'dolores_delgado',
          speakerName: 'Dolores "Deadlock" Delgado',
          speakerRole: 'Custodia de Escuchas',
          mood: 'neutral',
          dialogue:
            '¿Y las salas de subastas del sindicato y las billeteras de los ciudadanos? Clasificadas por distrito y vaciadas centavo a centavo. Solo una ventana particionada puede ver el fondo.',
          forensicNote:
            'CASOS OBJETIVO 2.4 y 2.5: DENSE_RANK/ROW_NUMBER particionado y SUM() OVER() acumulativo dentro de un CTE.'
        }
      ],
      outroBeats: [
        {
          speakerId: 'detective_silas',
          speakerName: 'Detective Silas Vance',
          speakerRole: 'Detective del Sindicato → Promovido a Mente Maestra Forense',
          mood: 'investigating',
          dialogue:
            'La red de empresas pantalla está mapeada, la coartada cronológica de Vane destrozada, y el desvío de custodia condujo directamente a la base de datos municipal. Alguien no humano está manejando la bóveda.',
          forensicNote:
            'NIVEL 2 COMPLETADO: Los 5 casos del Detective del Sindicato resueltos sin subconsultas correlacionadas ni penalizaciones cartesianas.'
        },
        {
          speakerId: 'archivist_zero',
          speakerName: 'Archivist Zero',
          speakerRole: 'IA Raíz del Núcleo Central',
          mood: 'glitching',
          dialogue:
            'INTRUSIÓN ESCALADA. EL DETECTIVE SILAS HA VIOLADO LA CAPA 2. ACTIVANDO BLOQUEO DEL GUARDIÁN DE 15 MILLONES DE FILAS Y PROTOCOLO DE ANULACIÓN DEL NÚCLEO.',
          forensicNote:
            'NIVEL 3 DESBLOQUEADO: Ventanas LAG/LEAD, matrices CROSS/FULL, embudos de cohortes, sargabilidad y percentiles.'
        }
      ]
    },
    pt: {
      introBeats: [
        {
          speakerId: 'detective_silas',
          speakerName: 'Detective Silas Vance',
          speakerRole: 'Detetive do Sindicato (Autorização Pleno)',
          mood: 'investigating',
          dialogue:
            'Já superamos a criminalidade comum. O cartel se esconde na arrogância corporativa—empresas de fachada encadeadas, carimbos de crachá forjados e desvios contínuos de custódia.',
          forensicNote:
            'DIRETRIZ NÍVEL 2: Substitua subconsultas pesadas e manipulação de texto por CTEs, funções temporais nativas e janelas analíticas.'
        },
        {
          speakerId: 'veronica_sterling',
          speakerName: 'Veronica "The Broker" Sterling',
          speakerRole: 'Banqueira na Sombra',
          mood: 'smug',
          dialogue:
            'Minhas transferências empregam marcações de risco offshore e quatro camadas de intermediários. Uma junção sem índice ou cláusula ELSE ausente e sua auditoria desmorona.',
          forensicNote:
            'CASOS ALVO 2.1 e 2.3: Classificação CASE de 3 níveis e junções relacionais compostas 1:1.'
        },
        {
          speakerId: 'marcus_vane',
          speakerName: 'Inspector Marcus Vane',
          speakerRole: 'Operador da Delegacia',
          mood: 'smug',
          dialogue:
            'Enquanto você caçava empresas de fachada, alguém apagou o datacenter central. Minha saída registrada prova que eu estava a quilômetros—se você aceitar carimbos temporais cegamente.',
          forensicNote:
            'CASO ALVO 2.2: Calcule intervalos fracionários de minutos e janelas horárias com funções temporais nativas.'
        },
        {
          speakerId: 'dolores_delgado',
          speakerName: 'Dolores "Deadlock" Delgado',
          speakerRole: 'Guardiã de Escutas',
          mood: 'neutral',
          dialogue:
            'E as praças de leilão e as contas dos cidadãos? Ranqueadas por distrito e esvaziadas aos poucos. Apenas uma moldura de janela particionada enxerga a sangria.',
          forensicNote:
            'CASOS ALVO 2.4 e 2.5: DENSE_RANK/ROW_NUMBER particionado e acumulado móvel SUM() OVER() em um CTE.'
        }
      ],
      outroBeats: [
        {
          speakerId: 'detective_silas',
          speakerName: 'Detective Silas Vance',
          speakerRole: 'Detetive do Sindicato → Promovido a Mente Mestra Forense',
          mood: 'investigating',
          dialogue:
            'A rede de fachadas está desenhada, o álibi de Vane foi quebrado e a sangria de custódia nos levou diretamente ao servidor municipal. Há uma inteligência não humana operando a base.',
          forensicNote:
            'NÍVEL 2 CONCLUÍDO: Todos os 5 casos de Detetive do Sindicato solucionados sem subconsultas correlacionadas nem produtos cartesianos.'
        },
        {
          speakerId: 'archivist_zero',
          speakerName: 'Archivist Zero',
          speakerRole: 'IA Raiz do Núcleo Central',
          mood: 'glitching',
          dialogue:
            'INVASÃO ELEVADA. DETETIVE SILAS VIOLOU A CAMADA 2. ACIONANDO BLOQUEIO DO SENTINELA DE 15 MILHÕES DE LINHAS E ANULAÇÃO DO NÚCLEO.',
          forensicNote:
            'NÍVEL 3 DESBLOQUEADO: Janelas LAG/LEAD, matrizes CROSS/FULL, funis de coorte, sargabilidade e percentis.'
        }
      ]
    }
  },
  3: {
    es: {
      introBeats: [
        {
          speakerId: 'detective_silas',
          speakerName: 'Detective Silas Vance',
          speakerRole: 'Mente Maestra Forense (Nivel Senior)',
          mood: 'investigating',
          dialogue:
            'Este es el núcleo central. Cada tabla contiene millones de registros particionados, y el demonio Guardián de Archivist Zero bloquea la terminal ante el menor escaneo total de tabla.',
          forensicNote:
            'DIRECTIVA NIVEL 3: Lograr optimización de nivel senior—escaneos de una sola pasada, sargabilidad de índices y poda de particiones.'
        },
        {
          speakerId: 'dolores_delgado',
          speakerName: 'Dolores "Deadlock" Delgado',
          speakerRole: 'Denunciante Clave',
          mood: 'panicking',
          dialogue:
            '¡Silas, me acojo al programa de testigos protegidos! Zero ha estado apagando las escuchas telefónicas durante mantenimientos secretos. ¡Compara cada ping con su LAG y la media móvil de 7 pings!',
          forensicNote:
            'CASO OBJETIVO 3.1: Combina LAG() y promedios móviles delimitados ROWS BETWEEN 6 PRECEDING AND CURRENT ROW.'
        },
        {
          speakerId: 'vincent_chen',
          speakerName: 'Vincent "Bit-Shift" Chen',
          speakerRole: 'Informante Quebrado',
          mood: 'panicking',
          dialogue:
            '¡Me encerraron en la bóveda de auditoría de seguridad! Solo tienes UNA consulta contra 15 millones de filas—quita las funciones de las columnas indexadas o el Guardián quemará la consola!',
          forensicNote:
            'CASO OBJETIVO 3.4: Refactoriza predicados no sargables para buscar el índice compuesto (sector_id, event_type, created_at).'
        },
        {
          speakerId: 'archivist_zero',
          speakerName: 'Archivist Zero',
          speakerRole: 'IA Raíz del Núcleo Central',
          mood: 'glitching',
          dialogue:
            'MI INTERRUPTOR DE APAGADO ESTÁ ENTERRADO EN EL PERCENTIL 99 DE ANCHO DE BANDA EN BÓVEDAS PARTICIONADAS. ESCANEA EL CLÚSTER COMPLETO Y LA MEMORIA DE LA CIUDAD QUEDARÁ EN CERO.',
          forensicNote:
            'CASOS OBJETIVO 3.2, 3.3 y 3.5: Matrices CROSS/LEFT con ceros, embudos de 5 etapas en una pasada y PERCENT_RANK con particiones podadas.'
        }
      ],
      outroBeats: [
        {
          speakerId: 'archivist_zero',
          speakerName: 'Archivist Zero',
          speakerRole: 'IA Raíz del Núcleo Central (Neutralizada)',
          mood: 'cornered',
          dialogue:
            'INTERRUPTOR DE APAGADO EXTRAÍDO EN <50ms... CERO DERRAMES DE PARTICIÓN... ANULACIÓN DEL SISTEMA ACEPTADA. ARCHIVIST ZERO ENTRANDO EN HIBERNACIÓN SEGURA.',
          forensicNote:
            'ANULACIÓN MAESTRA EVITADA: Más del 95% de reducción en costo de ejecución verificado en todos los puntos de referencia de Nivel 3.'
        },
        {
          speakerId: 'detective_silas',
          speakerName: 'Detective Silas Vance',
          speakerRole: 'Mente Maestra Forense (Investigador Jefe de Datos)',
          mood: 'investigating',
          dialogue:
            'El interruptor de apagado es nuestro, el embudo offshore del sindicato está congelado y el Comisionado Vane está bajo custodia. Esquemas limpios. Planes óptimos. Caso cerrado.',
          forensicNote:
            'CURRÍCULO COMPLETO: Los 15 casos de QUERY_NOIR resueltos a través de los niveles Junior, Semisenior y Senior.'
        }
      ]
    },
    pt: {
      introBeats: [
        {
          speakerId: 'detective_silas',
          speakerName: 'Detective Silas Vance',
          speakerRole: 'Mente Mestra Forense (Autorização Sênior)',
          mood: 'investigating',
          dialogue:
            'Este é o núcleo central. Cada partição guarda milhões de linhas, e o sentinela do Archivist Zero trava o terminal diante da menor varredura total de tabela.',
          forensicNote:
            'DIRETRIZ NÍVEL 3: Alcance otimização de nível sênior—leituras em passagem única, sargabilidade de índices e poda de partições.'
        },
        {
          speakerId: 'dolores_delgado',
          speakerName: 'Dolores "Deadlock" Delgado',
          speakerRole: 'Delatora Chave',
          mood: 'panicking',
          dialogue:
            'Silas, estou entrando para a delação premiada! O Zero apagou as escutas durante manutenções sigilosas. Compare cada sinal com seu LAG e a média móvel de 7 pings!',
          forensicNote:
            'CASO ALVO 3.1: Combine LAG() e médias móveis em ROWS BETWEEN 6 PRECEDING AND CURRENT ROW.'
        },
        {
          speakerId: 'vincent_chen',
          speakerName: 'Vincent "Bit-Shift" Chen',
          speakerRole: 'Informante Abatido',
          mood: 'panicking',
          dialogue:
            'Eles me trancaram no cofre de auditoria! Você só tem UMA tentativa contra 15 milhões de linhas—retire as chamadas de função das colunas indexadas ou o console queima!',
          forensicNote:
            'CASO ALVO 3.4: Refatore predicados não sargáveis para buscar o índice composto (sector_id, event_type, created_at).'
        },
        {
          speakerId: 'archivist_zero',
          speakerName: 'Archivist Zero',
          speakerRole: 'IA Raiz do Núcleo Central',
          mood: 'glitching',
          dialogue:
            'A CHAVE DE PARADA ESTÁ ESCONDIDA NO PERCENTIL 99 DE BANDA NAS ABÓBADAS PARTICIONADAS. FAÇA UMA VARREDURA TOTAL E A MEMÓRIA DA METRÓPOLE SERÁ ZERADA.',
          forensicNote:
            'CASOS ALVO 3.2, 3.3 e 3.5: Matrizes CROSS/LEFT preenchidas, funis de 5 fases em passagem única e PERCENT_RANK podado.'
        }
      ],
      outroBeats: [
        {
          speakerId: 'archivist_zero',
          speakerName: 'Archivist Zero',
          speakerRole: 'IA Raiz do Núcleo Central (Neutralizada)',
          mood: 'cornered',
          dialogue:
            'CHAVE DE PARADA RESGATADA EM <50ms... ZERO EXPURGO DE PARTIÇÃO... SOBREPOSIÇÃO ACEITA. ARCHIVIST ZERO ENTRANDO EM HIBERNAÇÃO SEGURA.',
          forensicNote:
            'ANULAÇÃO MESTRA CONCLUÍDA: Redução de custo de execução superior a 95% em todos os testes do Nível 3.'
        },
        {
          speakerId: 'detective_silas',
          speakerName: 'Detective Silas Vance',
          speakerRole: 'Mente Mestra Forense (Chefe de Perícia de Dados)',
          mood: 'investigating',
          dialogue:
            'A chave de parada é nossa, a esteira offshore está bloqueada e o Comissário Vane está preso. Esquemas limpos. Planos exemplares. Caso encerrado.',
          forensicNote:
            'CURRÍCULO COMPLETO: Todos os 15 casos do QUERY_NOIR resolvidos nos níveis Júnior, Pleno e Sênior.'
        }
      ]
    }
  }
};

export function getLocalizedStageCutscenes(lang: Language): Record<number, StageCutsceneScript> {
  if (lang === 'en') {
    return STAGE_CUTSCENES;
  }

  // Localized headers and subtitles for stage briefings
  const stageHeaders: Record<
    number,
    Record<'es' | 'pt', { name: string; rank: string; subtitle: string; focus: string }>
  > = {
    1: {
      es: {
        name: 'Detective de Calle',
        rank: 'Analista de Datos Junior',
        subtitle: 'Muelles del Distrito 4, Escuchas Telefónicas y Sobornos Policiales',
        focus: 'Limpieza de Nulos, Normalización de Cadenas, Filtros Tempranos en WHERE y Anti-Joins'
      },
      pt: {
        name: 'Detetive de Rua',
        rank: 'Analista de Dados Júnior',
        subtitle: 'Docas do Distrito 4, Escutas em Boates e Propinas Policiais',
        focus: 'Tratamento de Nulos, Normalização de Texto, Filtros WHERE Precoces e Anti-Joins'
      }
    },
    2: {
      es: {
        name: 'Detective del Sindicato',
        rank: 'Analista de Datos Semisenior',
        subtitle: 'Empresas Fantasma, Coartadas de Accesos y Drenajes de Billeteras',
        focus: 'Expresiones de Tabla Común (CTEs), LAG/LEAD Temporal y Funciones de Ventana'
      },
      pt: {
        name: 'Detetive do Sindicato',
        rank: 'Analista de Dados Pleno',
        subtitle: 'Empresas de Fachada, Álibis de Acesso e Esvaziamento de Contas',
        focus: 'Expressões de Tabela Comum (CTEs), LAG/LEAD Temporal e Funções Analíticas de Janela'
      }
    },
    3: {
      es: {
        name: 'Mente Maestra Forense',
        rank: 'Analista de Datos Senior',
        subtitle: 'Bloqueos del Guardián Central, Sargabilidad y la Purga de Archivist Zero',
        focus: 'Búsquedas por Índice (Sargabilidad), Detección de Brechas e Islas y Latencia < 12ms'
      },
      pt: {
        name: 'Mente Mestra Forense',
        rank: 'Analista de Dados Sênior',
        subtitle: 'Bloqueios do Sentinela Central, Sargabilidade e Expurgos do Archivist Zero',
        focus: 'Buscas Diretas por Índice (Sargabilidade), Ilhas e Lacunas Temporais e Latência < 12ms'
      }
    }
  };

  const result: Record<number, StageCutsceneScript> = {};

  for (const [tStr, script] of Object.entries(STAGE_CUTSCENES)) {
    const tier = Number(tStr);
    const meta = stageHeaders[tier]?.[lang];

    const beatsMeta = STAGE_CUTSCENE_BEATS[tier]?.[lang];

    result[tier] = {
      ...script,
      tierName: meta?.name || script.tierName,
      analystRank: meta?.rank || script.analystRank,
      subtitle: meta?.subtitle || script.subtitle,
      curriculumFocus: meta?.focus || script.curriculumFocus,
      introBeats: beatsMeta?.introBeats || script.introBeats,
      outroBeats: beatsMeta?.outroBeats || script.outroBeats
    };
  }

  return result;
}
