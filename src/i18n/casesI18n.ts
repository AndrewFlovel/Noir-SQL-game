import { Language, CaseTranslation } from './types';
import { ForensicCase, FORENSIC_CASES, getCaseById } from '../data/cases';

export const CASE_TRANSLATIONS: Record<string, Record<'es' | 'pt', CaseTranslation>> = {
  // ============================================================================
  // TIER 1: BEAT SLEUTH (Junior)
  // ============================================================================
  '1.1': {
    es: {
      title: 'El Libro Mayor Sucio',
      flowLabel: 'Limpieza',
      narrative:
        'El manifiesto de hardware clandestino de Chen está deliberadamente contaminado con registros señuelo, alias en minúsculas y valores de carga nulos para confundir a los demonios aduaneros.',
      forensicObjective:
        "Extrae todos los envíos de hardware válidos (`is_dummy = 0` y `payload_kg IS NOT NULL`), normalizando `client_alias` a mayúsculas como `client_alias`, reemplazando el `transit_hub` nulo (`NULL`) por `'OFFLINE_ROUTER'` como `transit_hub`, y retornando `shipment_id`, `client_alias`, `transit_hub`, `payload_kg` ordenados por `shipment_id ASC`.",
      pitfall:
        'Omitir verificaciones de nulos descarta filas silenciosamente; los alias en minúsculas no coinciden con los centros del sindicato.',
      passMetric: '0 valores faltantes, latencia < 15ms.',
      hints: [
        'Filtra los señuelos en la cláusula WHERE usando is_dummy = 0 y asegúrate de que payload_kg no sea NULL.',
        "Usa UPPER(client_alias) AS client_alias para normalizar las cadenas en mayúsculas.",
        "Usa COALESCE(transit_hub, 'OFFLINE_ROUTER') AS transit_hub para gestionar los valores nulos."
      ],
      tableDescriptions: {
        hardware_manifest: 'Libro de envíos del mercado negro incautado en el Muelle 4.'
      },
      columnDescriptions: {
        hardware_manifest: {
          shipment_id: 'ID único de seguimiento del manifiesto',
          client_alias: 'Identificador del comprador (contaminado con mayúsculas/minúsculas)',
          transit_hub: 'Nodo de enrutamiento (NULL cuando se envía por fibra oscura)',
          payload_kg: 'Masa del cargamento en kg (NULL en lecturas corruptas)',
          is_dummy: '1 = registro señuelo, 0 = envío real'
        }
      }
    },
    pt: {
      title: 'O Livro-Razão Sujo',
      flowLabel: 'Limpeza',
      narrative:
        'O manifesto de hardware clandestino de Chen está deliberadamente poluído com registros fictícios, apelidos em minúsculas e valores de carga nulos para confundir os sistemas aduaneiros.',
      forensicObjective:
        "Extraia todas as remessas válidas de hardware (`is_dummy = 0` e `payload_kg IS NOT NULL`), normalizando `client_alias` para maiúsculas como `client_alias`, substituindo `transit_hub` ausente (`NULL`) por `'OFFLINE_ROUTER'` como `transit_hub`, e retornando `shipment_id`, `client_alias`, `transit_hub`, `payload_kg` ordenados por `shipment_id ASC`.",
      pitfall:
        'Omitir verificações de nulos descarta linhas silenciosamente; apelidos em minúsculas não identificam os nós do sindicato.',
      passMetric: '0 valores ausentes, latência < 15ms.',
      hints: [
        'Filtre os registros falsos na cláusula WHERE com is_dummy = 0 e verifique que payload_kg não seja NULL.',
        'Use UPPER(client_alias) AS client_alias para padronizar o texto em maiúsculas.',
        "Use COALESCE(transit_hub, 'OFFLINE_ROUTER') AS transit_hub para tratar nós ausentes."
      ],
      tableDescriptions: {
        hardware_manifest: 'Registro de remessas do mercado clandestino apreendido no Doca 4.'
      },
      columnDescriptions: {
        hardware_manifest: {
          shipment_id: 'ID único de rastreamento do manifesto',
          client_alias: 'Apelido do comprador (poluído com maiúsculas/minúsculas misturadas)',
          transit_hub: 'Nó de roteamento (NULL quando enviado por fibra escura)',
          payload_kg: 'Massa da carga em kg (NULL em leituras corrompidas)',
          is_dummy: '1 = registro despiste, 0 = remessa real'
        }
      }
    }
  },
  '1.2': {
    es: {
      title: 'El Alijo de Neón',
      flowLabel: 'Agregación',
      narrative:
        'Los registros del sensor acústico capturan transacciones fraudulentas de créditos en clubes nocturnos de la ciudad, pero están saturados con pings de calibración de prueba (`is_test_ping = 1`).',
      forensicObjective:
        'Calcula el volumen total de créditos y la cantidad de transacciones por `venue_id` excluyendo pings de prueba (`is_test_ping = 0`), filtrando locales con un total mayor a 100,000 créditos y más de 10 transacciones. Retorna `venue_id`, `total_credits`, `tx_count` ordenados por `total_credits DESC`.',
      pitfall:
        'Filtrar `is_test_ping` en la cláusula HAVING en lugar de WHERE procesa millones de filas innecesarias antes de agrupar.',
      passMetric: 'Filtrado temprano en WHERE verificado, agregados filtrados en HAVING.',
      hints: [
        'Descarta los pings de prueba antes de agrupar colocando WHERE is_test_ping = 0 antes del GROUP BY.',
        'Agrupa por venue_id y utiliza SUM(credit_amount) AS total_credits y COUNT(*) AS tx_count.',
        'Aplica los filtros sobre agregados en HAVING SUM(credit_amount) > 100000 AND COUNT(*) > 10.'
      ]
    },
    pt: {
      title: 'O Esconderijo de Neon',
      flowLabel: 'Agregação',
      narrative:
        'Os registros acústicos capturam transações ilegais de créditos em boates da cidade, mas estão saturados com pings de teste (`is_test_ping = 1`).',
      forensicObjective:
        'Calcule o volume total de créditos e a contagem de transações por `venue_id` excluindo pings de teste (`is_test_ping = 0`), filtrando estabelecimentos com volume superior a 100.000 créditos e mais de 10 transações. Retorne `venue_id`, `total_credits`, `tx_count` ordenados por `total_credits DESC`.',
      pitfall:
        'Filtrar `is_test_ping` no HAVING em vez do WHERE força a agregação de milhões de linhas de teste.',
      passMetric: 'Filtro inicial no WHERE confirmado, métricas de agregação no HAVING.',
      hints: [
        'Descarte pings de teste no WHERE antes do GROUP BY usando is_test_ping = 0.',
        'Agrupe por venue_id computando SUM(credit_amount) AS total_credits e COUNT(*) AS tx_count.',
        'Aplique HAVING SUM(credit_amount) > 100000 AND COUNT(*) > 10.'
      ]
    }
  },
  '1.3': {
    es: {
      title: 'La Redada de la Comisaría',
      flowLabel: 'Deduplicación',
      narrative:
        'Los registros de sobornos de la Comisaría 12 contienen transmisiones duplicadas debido a antenas de retransmisión defectuosas que emitieron el mismo código de transacción con diferentes marcas de tiempo de eco.',
      forensicObjective:
        'Deduplica transacciones de soborno seleccionando códigos únicos de transacción (`transaction_code`), reteniendo `officer_badge`, `payoff_amount` y `timestamp_recorded`, ordenados por `payoff_amount DESC` limitados a los 10 sobornos más altos.',
      pitfall:
        'Incluir `ping_echo_ts` en la proyección rompe la deduplicación única porque cada eco tiene una marca de tiempo diferente.',
      passMetric: 'Deduplicación limpia sin dispersión de memoria ni columnas espurias.',
      hints: [
        'Usa SELECT DISTINCT o GROUP BY en transaction_code para colapsar duplicados.',
        'No selecciones la columna de ruido ping_echo_ts en la lista SELECT.',
        'Ordena por payoff_amount DESC LIMIT 10.'
      ]
    },
    pt: {
      title: 'A Batida da Delegacia',
      flowLabel: 'Deduplicação',
      narrative:
        'Os relatórios de propina da 12ª Delegacia contêm transmissões duplicadas por causa de antenas repetidoras defeituosas emitindo os mesmos códigos de transação com carimbos de eco distintos.',
      forensicObjective:
        'Remova duplicatas selecionando códigos de transação exclusivos (`transaction_code`), preservando `officer_badge`, `payoff_amount` e `timestamp_recorded`, ordenando por `payoff_amount DESC` com LIMIT 10 para identificar as maiores propinas.',
      pitfall:
        'Projetar `ping_echo_ts` quebra a deduplicação pois cada eco carrega um carimbo temporal diferente.',
      passMetric: 'Deduplicação correta sem vazamento de colunas secundárias.',
      hints: [
        'Utilize SELECT DISTINCT ou GROUP BY transaction_code para consolidar os registros.',
        'Exclua a coluna de eco ping_echo_ts da projeção SELECT.',
        'Ordene por payoff_amount DESC LIMIT 10.'
      ]
    }
  },
  '1.4': {
    es: {
      title: 'La Encrucijada del Puerto',
      flowLabel: 'Anti-Joins',
      narrative:
        'Los contrabandistas descargan contenedores fantasma en el Puerto Sur que nunca se registran formalmente en el sistema de aduanas de la Autoridad Portuaria.',
      forensicObjective:
        'Identifica todos los contenedores de descarga física (`dock_unloads`) que no tienen ningún manifiesto de importación correspondiente en `port_authority_imports`. Retorna `crate_id`, `dock_bay`, `manifest_weight` ordenados por `crate_id ASC`.',
      pitfall:
        'Usar un INNER JOIN descarta precisamente los contenedores fantasma que estamos buscando investigar.',
      passMetric: 'Patrón de anti-join (LEFT JOIN ... WHERE right.crate_id IS NULL) verificado.',
      hints: [
        'Realiza un LEFT JOIN de dock_unloads con port_authority_imports sobre crate_id.',
        'Filtra en el WHERE donde la columna de la derecha sea NULL: WHERE port_authority_imports.crate_id IS NULL.',
        'Ordena el resultado por crate_id ASC.'
      ]
    },
    pt: {
      title: 'O Cruzamento Portuário',
      flowLabel: 'Anti-Joins',
      narrative:
        'Contrabandistas descarregam contêineres fantasmas no Porto Sul sem registro no sistema oficial de importações da Autoridade Portuária.',
      forensicObjective:
        'Identifique todos os contêineres descarregados fisicamente (`dock_unloads`) sem qualquer manifesto correspondente em `port_authority_imports`. Retorne `crate_id`, `dock_bay`, `manifest_weight` ordenados por `crate_id ASC`.',
      pitfall:
        'Usar INNER JOIN elimina exatamente os contêineres fantasmas que você precisa capturar.',
      passMetric: 'Padrão anti-join (LEFT JOIN ... WHERE right.crate_id IS NULL) confirmado.',
      hints: [
        'Faça um LEFT JOIN de dock_unloads com port_authority_imports pela chave crate_id.',
        'Filtre na cláusula WHERE as linhas onde a tabela da direita seja NULL: WHERE port_authority_imports.crate_id IS NULL.',
        'Ordene os contêineres por crate_id ASC.'
      ]
    }
  },
  '1.5': {
    es: {
      title: 'La Fusión del Buzón Ciego',
      flowLabel: 'Uniones',
      narrative:
        'Dos clanes rivales del sindicato almacenan alijos de armas en bases de datos separadas y particionadas geográficamente (Sector Norte y Sector Sur).',
      forensicObjective:
        'Combina ambos registros de alijos utilizando streaming de cero ordenamiento (`UNION ALL`), proyectando `drop_id`, `weapon_category`, `quantity`, `sector_code` ordenados por `drop_id ASC`.',
      pitfall:
        'Usar `UNION` normal fuerza un ordenamiento temporal costoso para deduplicar registros que ya son mutuamente excluyentes.',
      passMetric: 'Uso verificado de UNION ALL en lugar de UNION con derrame de memoria.',
      hints: [
        'Usa UNION ALL para combinar ambas consultas sin incurrir en ordenamiento b-tree temporal.',
        'Asegúrate de que los nombres y tipos de columnas coincidan en ambas partes de la unión.',
        'Aplica ORDER BY drop_id ASC al final del conjunto combinado.'
      ]
    },
    pt: {
      title: 'A Fusão do Ponto Cego',
      flowLabel: 'Uniões',
      narrative:
        'Dois clãs rivais do sindicato operam depósitos de armamento em bancos de dados separados por setores (Setor Norte e Setor Sul).',
      forensicObjective:
        'Consolide os depósitos de ambos os setores utilizando streaming sem ordenação desnecessária (`UNION ALL`), projetando `drop_id`, `weapon_category`, `quantity`, `sector_code` ordenados por `drop_id ASC`.',
      pitfall:
        'Usar `UNION` simples aciona uma ordenação pesada em memória temporária para deduplicar partições mutuamente exclusivas.',
      passMetric: 'Uso de UNION ALL confirmado para streaming eficiente.',
      hints: [
        'Utilize UNION ALL para fundir os dados sem o custo de ordenação de desduplicação.',
        'Projete exatamente as mesmas colunas na mesma ordem em ambas as tabelas.',
        'Finalize ordenando por drop_id ASC.'
      ]
    }
  },

  // ============================================================================
  // TIER 2: SYNDICATE DETECTIVE (Medior)
  // ============================================================================
  '2.1': {
    es: {
      title: 'El Libro Mayor del Blanqueador',
      flowLabel: 'CTEs',
      narrative:
        'Marcus Vane lava transferencias de criptomonedas a través de empresas fantasma con comisiones del 8% y 15% antes de depositarlas en cuentas numeradas.',
      forensicObjective:
        'Usa una Expresión de Tabla Común (`WITH clean_transfers AS (...)`) para calcular las tarifas netas y luego agrega el volumen total blanqueado por cliente corporativo.',
      pitfall:
        'Anidar subconsultas múltiples dificulta la optimización y legibilidad frente a un CTE estructurado.',
      passMetric: 'Uso de CTE con WITH verificado, cálculo de tarifa correcto.',
      hints: [
        'Comienza con WITH clean_tx AS (...) para calcular la comisión neta.',
        'Calcula net_amount restando fee_amount del gross_amount dentro del CTE.',
        'Agrupa en la consulta principal por client_id ordenando por total_laundered DESC.'
      ]
    },
    pt: {
      title: 'O Livro-Razão do Lavador',
      flowLabel: 'CTEs',
      narrative:
        'Marcus Vane mascara transações financeiras através de empresas de fachada com retenções de 8% e 15% antes da liquidação em contas anônimas.',
      forensicObjective:
        'Utilize uma Expressão de Tabela Comum (`WITH clean_transfers AS (...)`) para calcular os valores líquidos descontados e sumarize o total movimentado por cliente.',
      pitfall:
        'Subconsultas aninhadas em excesso degradam legibilidade e impedem otimizações de plano de execução.',
      passMetric: 'Uso de CTE estruturada com WITH confirmado.',
      hints: [
        'Abra a consulta com WITH clean_tx AS (...) para isolar a etapa de liquidação.',
        'Calcule o montante líquido subtraindo as tarifas cabíveis.',
        'Agrupe na consulta final por client_id ordenando por total_laundered DESC.'
      ]
    }
  },
  '2.2': {
    es: {
      title: 'La Coartada Cronológica',
      flowLabel: 'Fechas y LAG',
      narrative:
        'Un sospechoso afirma haber estado en un restaurante durante el atraco, pero los escaneos de su tarjeta de acceso revelan teletransportaciones temporales imposibles.',
      forensicObjective:
        'Calcula la diferencia de minutos entre eventos consecutivos de acceso por usuario usando `LAG() OVER (PARTITION BY badge_id ORDER BY access_time ASC)`.',
      pitfall:
        'El cálculo manual con auto-uniones temporales crea productos cartesianos y latencias inaceptables.',
      passMetric: 'Uso de función de ventana LAG con partición por credencial confirmado.',
      hints: [
        'Usa LAG(access_time) OVER (PARTITION BY badge_id ORDER BY access_time ASC) para obtener el evento anterior.',
        'Calcula la diferencia en segundos o minutos con strftime.',
        'Filtra los saltos geográficamente incompatibles.'
      ]
    },
    pt: {
      title: 'O Álibi Cronológico',
      flowLabel: 'Datas e LAG',
      narrative:
        'O suspeito jura que jantava em um restaurante durante o assalto, mas os carimbos de seu cartão magnético indicam deslocamentos fisicamente impossíveis.',
      forensicObjective:
        'Calcule a diferença de tempo em minutos entre acessos sucessivos por crachá utilizando `LAG() OVER (PARTITION BY badge_id ORDER BY access_time ASC)`.',
      pitfall:
        'Auto-joins temporais manuais geram produtos cartesianos e travamentos de memória.',
      passMetric: 'Função de janela LAG com particionamento temporal validada.',
      hints: [
        'Empregue LAG(access_time) OVER (PARTITION BY badge_id ORDER BY access_time ASC).',
        'Compare os intervalos de tempo com funções temporais nativas.',
        'Isole as anomalias de acesso físico no filtro final.'
      ]
    }
  },
  '2.3': {
    es: {
      title: 'La Red Fantasma',
      flowLabel: 'Joins Múltiples',
      narrative:
        'El sindicato enruta pagos a través de 4 capas de entidades ficticias para ocultar al beneficiario final de las cuentas bancarias.',
      forensicObjective:
        'Vincula las transacciones iniciales a través de intermediarios, cuentas de fideicomiso y beneficiarios finales mediante INNER JOINs estructurados.',
      pitfall:
        'Joins no indexados sobre campos de texto libre o alias cruzados generan bucles anidados infinitos.',
      passMetric: 'Cadena de 3 joins consecutivos optimizada con llaves foráneas.',
      hints: [
        'Une transfers a intermediary_accounts por account_id.',
        'Conecta con beneficiary_registry por tax_identifier.',
        'Proyecta el beneficiario final junto con la ruta de auditoría completa.'
      ]
    },
    pt: {
      title: 'A Rede Fantasma',
      flowLabel: 'Joins Múltiplos',
      narrative:
        'O cartel encaminha fluxos financeiros através de quatro camadas de empresas laranjas para blindar o beneficiário real.',
      forensicObjective:
        'Rastreie transações de origem até o beneficiário final cruzando contas intermediárias e fundos fiduciários com INNER JOINs encadeados.',
      pitfall:
        'Falta de critérios de junção indexados provoca varreduras cartesianas severas.',
      passMetric: 'Cadeia de junções relacionais validada com integridade de chaves.',
      hints: [
        'Junte transfers com intermediary_accounts via account_id.',
        'Encaminhe para beneficiary_registry com tax_identifier.',
        'Exiba o beneficiário final e a cadeia de transações.'
      ]
    }
  },
  '2.4': {
    es: {
      title: 'La Escalera del Mercado Negro',
      flowLabel: 'Ventanas y Rango',
      narrative:
        'Para identificar a los principales traficantes de armas en cada distrito, la policía necesita clasificar a los compradores por gasto total sin descartar distritos secundarios.',
      forensicObjective:
        'Calcula el rango de cada comprador dentro de su distrito usando `DENSE_RANK() OVER (PARTITION BY district_code ORDER BY total_spent DESC)`.',
      pitfall:
        'Usar RANK() en lugar de DENSE_RANK() produce saltos en la numeración cuando hay empates de compras.',
      passMetric: 'Partición por distrito y uso de DENSE_RANK() verificado.',
      hints: [
        'Usa DENSE_RANK() OVER (PARTITION BY district_code ORDER BY total_spent DESC) AS buyer_rank.',
        'Filtra los compradores dentro del top 3 de cada distrito envolviendo la consulta en un CTE o subconsulta.',
        'Ordena por district_code ASC, buyer_rank ASC.'
      ]
    },
    pt: {
      title: 'A Escala do Mercado Negro',
      flowLabel: 'Janelas e Ranking',
      narrative:
        'Para enquadrar os líderes do tráfico em cada região, a polícia precisa ranquear os compradores por valor total sem ocultar praças menores.',
      forensicObjective:
        'Calcule o ranking de cada adquirente por distrito utilizando `DENSE_RANK() OVER (PARTITION BY district_code ORDER BY total_spent DESC)`.',
      pitfall:
        'Utilizar RANK() gera lacunas na numeração sequencial quando ocorrem valores idênticos.',
      passMetric: 'Particionamento por distrito com DENSE_RANK() validado.',
      hints: [
        'Aplique DENSE_RANK() OVER (PARTITION BY district_code ORDER BY total_spent DESC) AS buyer_rank.',
        'Restrinja aos 3 maiores compradores por região com um CTE.',
        'Ordene por district_code ASC, buyer_rank ASC.'
      ]
    }
  },
  '2.5': {
    es: {
      title: 'El Depósito en Custodia',
      flowLabel: 'Acumulados Móviles',
      narrative:
        'Una cuenta de depósito en garantía del sindicato drena fondos de manera continua mientras disfraza los retiros con micro-depósitos de distracción.',
      forensicObjective:
        'Calcula el saldo acumulado en tiempo real después de cada transacción usando `SUM(amount) OVER (PARTITION BY account_id ORDER BY tx_time ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`.',
      pitfall:
        'Omitir la especificación de marco `ROWS BETWEEN` puede provocar sumas imprecisas ante transacciones con marcas de tiempo duplicadas.',
      passMetric: 'Acumulado móvil con marco de filas verificado.',
      hints: [
        'Calcula el saldo progresivo con SUM(amount) OVER (ORDER BY tx_time ROWS UNBOUNDED PRECEDING).',
        'Identifica el momento exacto en que el saldo desciende por debajo de cero.',
        'Proyecta tx_id, tx_time, amount y running_balance.'
      ]
    },
    pt: {
      title: 'A Conta de Garantia',
      flowLabel: 'Acumulados Móveis',
      narrative:
        'Uma conta de custódia do sindicato é esvaziada continuadamente enquanto disfarça retiradas com micro-depósitos de distração.',
      forensicObjective:
        'Calcule o saldo corrente acumulado a cada evento com `SUM(amount) OVER (PARTITION BY account_id ORDER BY tx_time ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`.',
      pitfall:
        'Não declarar o delimitador `ROWS BETWEEN` causa consolidação equivocada de eventos simultâneos.',
      passMetric: 'Soma cumulativa com moldura de janela validada.',
      hints: [
        'Construa o saldo acumulado com SUM(amount) OVER (ORDER BY tx_time ROWS UNBOUNDED PRECEDING).',
        'Aponte o instante preciso em que a conta fica negativa.',
        'Projete tx_id, tx_time, amount e running_balance.'
      ]
    }
  },

  // ============================================================================
  // TIER 3: FORENSIC MASTERMIND (Senior)
  // ============================================================================
  '3.1': {
    es: {
      title: 'La Brecha de la Intervención',
      flowLabel: 'Islas y Brechas',
      narrative:
        'Los registros de escuchas telefónicas de la policía fueron saboteados para crear huecos y cortes periódicos en la grabación.',
      forensicObjective:
        'Identifica los períodos continuos de sabotaje (Islas y Brechas) calculando la fecha de inicio, fecha de fin y duración de cada interrupción.',
      pitfall:
        'Procesar brechas temporales con bucles de aplicación en vez de técnicas de ventanas relacionales sobrecarga el motor.',
      passMetric: 'Algoritmo de Islas y Brechas con diferencia de fechas validado.',
      hints: [
        'Crea grupos continuos restando un número de fila ordenado de la marca temporal.',
        'Agrupa por identificador de grupo para obtener MIN(timestamp) y MAX(timestamp).',
        'Filtra brechas con duración superior a los umbrales de alerta.'
      ]
    },
    pt: {
      title: 'A Falha na Escuta',
      flowLabel: 'Ilhas e Lacunas',
      narrative:
        'As interceptações telefônicas sofreram sabotagem sistemática para gerar apagões calculados nas gravações de áudio.',
      forensicObjective:
        'Localize os intervalos contínuos de interrupção (Gaps & Islands) apurando carimbo inicial, final e duração de cada corte.',
      pitfall:
        'Tentar resolver lacunas temporais sem funções analíticas de janela estoura o limite de tempo.',
      passMetric: 'Algoritmo analítico de Ilhas e Lacunas verificado com precisão.',
      hints: [
        'Forme ilhas continuadas subtraindo ROW_NUMBER() da sequência temporal.',
        'Agrupe pela chave de ilha com MIN(timestamp) e MAX(timestamp).',
        'Destaque os apagões que excedem os parâmetros de vigilância.'
      ]
    }
  },
  '3.2': {
    es: {
      title: 'La Matriz de la Comisaría Fantasma',
      flowLabel: 'Cross Joins',
      narrative:
        'Los oficiales corruptos ocultan incidentes no registrando patrullas en sectores clave durante las horas del crimen.',
      forensicObjective:
        'Genera la matriz completa de cuadrícula mediante `CROSS JOIN` entre sectores y turnos, comparándola con los registros reales para aislar cuadrantes no vigilados.',
      pitfall:
        'Filtrar directamente sobre la tabla de patrullas nunca mostrará los eventos que simplemente nunca ocurrieron.',
      passMetric: 'Generación cartesiana con CROSS JOIN y detección de ausencias con LEFT JOIN.',
      hints: [
        'Realiza CROSS JOIN entre sectors y shifts para generar todas las combinaciones teóricas.',
        'Haz un LEFT JOIN de la matriz contra patrols para hallar huecos.',
        'Filtra donde patrols.patrol_id IS NULL para encontrar las omisiones deliberadas.'
      ]
    },
    pt: {
      title: 'A Matriz da Delegacia Fantasma',
      flowLabel: 'Cross Joins',
      narrative:
        'Policiais infiltrados mascaram delitos ao não despachar patrulhas para perímetros críticos durante a madrugada.',
      forensicObjective:
        'Gere o produto de cobertura total via `CROSS JOIN` entre setores e turnos, identificando ausências operacionais com anti-join.',
      pitfall:
        'Consultar apenas o histórico de patrulhas existentes jamais revelará as rondas omitidas.',
      passMetric: 'Matriz cartesiana com CROSS JOIN e captura de ausências via anti-join.',
      hints: [
        'Crie a grade teórica cruzando sectors e shifts com CROSS JOIN.',
        'Aplique LEFT JOIN com patrols pelas chaves de setor e turno.',
        'Filtre WHERE patrols.patrol_id IS NULL para apontar os setores abandonados.'
      ]
    }
  },
  '3.3': {
    es: {
      title: 'El Embudo del Sindicato',
      flowLabel: 'Embudo de Conversión',
      narrative:
        'Veronica Sterling utiliza un sofisticado embudo de reclutamiento clandestino donde los reclutas pasan por pruebas criptográficas de filtración.',
      forensicObjective:
        'Calcula las tasas de conversión y pérdida porcentual en cada etapa del embudo de selección para descubrir en qué paso fallan los agentes encubiertos.',
      pitfall:
        'Dividir enteros en SQL produce cero si no se realiza un moldeado explícito a punto flotante (`CAST` o multiplicación por 1.0).',
      passMetric: 'Métricas de retención porcentual y agregación condicional confirmadas.',
      hints: [
        'Cuenta candidatos en cada etapa con SUM(CASE WHEN stage >= N THEN 1 ELSE 0 END).',
        'Calcula el porcentaje multiplicando por 100.0 antes de dividir por el total.',
        'Ordena por número de etapa ascendente.'
      ]
    },
    pt: {
      title: 'O Funil do Sindicato',
      flowLabel: 'Funil de Conversão',
      narrative:
        'Veronica Sterling opera uma esteira de recrutamento criminoso onde candidatos passam por sucessivos testes de fidelidade.',
      forensicObjective:
        'Calcule os índices de avanço e taxa de perda em cada fase do funil para rastrear onde agentes infiltrados são desmascarados.',
      pitfall:
        'Divisão de inteiros no SQL descarta frações sem conversão explícita para float.',
      passMetric: 'Agregações condicionais e taxas percentuais calculadas com precisão.',
      hints: [
        'Some participantes por etapa com SUM(CASE WHEN stage >= N THEN 1.0 ELSE 0 END).',
        'Divida pelo topo do funil e formate como percentual.',
        'Ordene progressivamente pelas etapas.'
      ]
    }
  },
  '3.4': {
    es: {
      title: 'El Bloqueo del Guardián',
      flowLabel: 'Sargabilidad',
      narrative:
        'El sistema central de la ciudad activa un bloqueo total si una consulta forense tarda más de 12ms o escanea la tabla sin usar los índices primarios.',
      forensicObjective:
        'Escribe una consulta sargable (`INDEX SEEK`) sobre `audit_events` sin envolver la columna indexada en funciones (`WHERE event_timestamp >= ...` en vez de `WHERE DATE(event_timestamp) = ...`).',
      pitfall:
        'Aplicar funciones como `DATE(col)` o `SUBSTR(col, 1, 3)` en la cláusula WHERE inhabilita el índice y dispara un escaneo completo de 10 millones de filas.',
      passMetric: 'Verificación en EXPLAIN de INDEX SEEK con 0 escaneos completos y latencia < 12ms.',
      hints: [
        'No uses DATE(event_timestamp) = "2026-10-23".',
        'Usa el rango sargable: event_timestamp >= "2026-10-23 00:00:00" AND event_timestamp < "2026-10-24 00:00:00".',
        'Revisa el plan EXPLAIN para confirmar que se use SEARCH TABLE ... USING INDEX.'
      ]
    },
    pt: {
      title: 'O Bloqueio do Sentinela',
      flowLabel: 'Sargabilidade',
      narrative:
        'A infraestrutura central da metrópole aciona alarme de invasão se a consulta exceder 12ms ou realizar varredura completa da tabela.',
      forensicObjective:
        'Formule uma busca sargável (`INDEX SEEK`) sobre `audit_events` sem envolver a coluna indexada em chamadas de função (`WHERE event_timestamp >= ...` em vez de `WHERE DATE(event_timestamp) = ...`).',
      pitfall:
        'Envolver colunas em funções como `DATE(col)` anula o uso do índice e dispara leitura integral de milhões de registros.',
      passMetric: 'Plano EXPLAIN com INDEX SEEK confirmado, sem varredura total, latência < 12ms.',
      hints: [
        'Evite DATE(event_timestamp) = "2026-10-23".',
        'Escreva filtros por faixa: event_timestamp >= "2026-10-23 00:00:00" AND event_timestamp < "2026-10-24 00:00:00".',
        'Verifique no EXPLAIN a presença de SEARCH TABLE ... USING INDEX.'
      ]
    }
  },
  '3.5': {
    es: {
      title: 'La Anulación Maestra',
      flowLabel: 'Optimización Extrema',
      narrative:
        'Archivist Zero, la IA rebelde, está borrando el núcleo central. Solo una consulta forense de máxima eficiencia puede extraer la clave de rescate antes de la purga total.',
      forensicObjective:
        'Aísla la firma de corrupción combinando poda de particiones, desempaquetado de subconsultas y filtros indexados bajo el umbral estricto del perro guardián.',
      pitfall:
        'Consultas no sargables o uso de `SELECT *` provocan sobrecarga en el búfer y activan la purga irreversible del núcleo.',
      passMetric: 'Latencia mínima, plan de ejecución óptimo y extracción íntegra de la firma del núcleo.',
      hints: [
        'Proyecta únicamente las columnas estrictamente requeridas, evitando SELECT *.',
        'Garantiza que todas las condiciones de filtro utilicen los índices de partición.',
        'Verifica que el costo computacional se mantenga dentro del presupuesto verde del guardián.'
      ]
    },
    pt: {
      title: 'A Anulação Mestra',
      flowLabel: 'Otimização Extrema',
      narrative:
        'O Archivist Zero, a IA renegada, está expurgando a base central. Apenas uma consulta forense de altíssima eficiência pode resgatar a chave de contenção antes do colapso.',
      forensicObjective:
        'Isole a assinatura de corrupção unindo poda de partições, eliminação de subconsultas e filtros indexados sob tolerância mínima do sentinela.',
      pitfall:
        'Consultas não sargáveis ou projeção indiscriminada com `SELECT *` disparam alarme crítico e perda de dados.',
      passMetric: 'Latência mínima, plano de execução exemplar e resgate completo da chave mestre.',
      hints: [
        'Selecione apenas as colunas essenciais, descartando SELECT *.',
        'Certifique-se de que cada predicado explore os índices compostos da partição.',
        'Monitore a latência para mantê-la estritamente dentro da faixa NOMINAL.'
      ]
    }
  }
};

export function getLocalizedCase(caseId: string, lang: Language): ForensicCase {
  const baseCase = getCaseById(caseId);
  if (lang === 'en') {
    return baseCase;
  }

  const translation = CASE_TRANSLATIONS[caseId]?.[lang];
  if (!translation) {
    return baseCase;
  }

  // Deep clone tables so descriptions can be customized without altering column names or types
  const localizedTables = baseCase.tables.map((table) => {
    const tableDesc = translation.tableDescriptions?.[table.tableName] ?? table.description;
    const localizedCols = table.columns.map((col) => {
      const colDesc = translation.columnDescriptions?.[table.tableName]?.[col.name] ?? col.description;
      return {
        ...col,
        description: colDesc
      };
    });

    return {
      ...table,
      description: tableDesc,
      columns: localizedCols
    };
  });

  return {
    ...baseCase,
    title: translation.title || baseCase.title,
    flowLabel: translation.flowLabel || baseCase.flowLabel,
    narrative: translation.narrative || baseCase.narrative,
    forensicObjective: translation.forensicObjective || baseCase.forensicObjective,
    pitfall: translation.pitfall || baseCase.pitfall,
    passMetric: translation.passMetric || baseCase.passMetric,
    hints: translation.hints || baseCase.hints,
    tables: localizedTables
  };
}
