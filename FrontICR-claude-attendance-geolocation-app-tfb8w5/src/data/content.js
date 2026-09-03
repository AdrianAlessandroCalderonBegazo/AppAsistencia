// Contenido central del sitio de Inversiones ICR.
// Fuente: Proyectos_ICR.pdf y DOCUMENTO_ESTRATEGICO_DE_IDENTIDAD_DE_MARCA_ICR.pdf
// Los datos de contacto (teléfono, correo, dirección, redes) son provisionales
// hasta que el cliente confirme la información real.

export const brand = {
  name: 'Inversiones ICR',
  tagline: 'Energía confiable. Soluciones inteligentes.',
  purpose:
    'Garantizar soluciones energéticas eficientes y confiables que mejoren la calidad de vida de las personas y permitan a las organizaciones operar sin interrupciones.',
  mission:
    'Diseñar, implementar y respaldar soluciones energéticas utilizando tecnología de alta calidad y conocimiento técnico especializado, asegurando eficiencia, seguridad y continuidad operativa para nuestros clientes.',
  vision:
    'Convertirnos en una empresa referente a nivel nacional en soluciones energéticas inteligentes, reconocida por nuestra capacidad técnica, innovación y compromiso con nuestros clientes.',
  promise: 'Energía confiable para proyectos que no pueden detenerse.',
  manifesto: [
    'La energía no es únicamente electricidad. Es productividad. Es desarrollo. Es seguridad.',
    'Es la capacidad de una empresa para continuar operando y de una familia para mejorar su calidad de vida.',
    'En Inversiones ICR creemos que cada proyecto energético debe ser diseñado con precisión, ejecutado con responsabilidad y respaldado por conocimiento técnico.',
    'Trabajamos con tecnología confiable, equipos de alta calidad y profesionales especializados para crear soluciones que respondan a las necesidades reales de nuestros clientes.',
    'No buscamos simplemente instalar sistemas. Buscamos construir relaciones de largo plazo, acompañando a cada cliente en la evolución de su infraestructura energética.',
    'Porque cuando la energía funciona correctamente, las personas y organizaciones pueden avanzar.',
  ],
  brandContext:
    'Inversiones ICR es una empresa especializada en soluciones energéticas, enfocada en la comercialización de componentes electrónicos, sistemas de energía solar y tecnologías relacionadas con eficiencia y respaldo energético. Desarrollamos proyectos B2B para industrias, minería, instituciones públicas, gobiernos y organizaciones con necesidades críticas de continuidad energética, y atendemos el mercado B2C mediante kits solares y soluciones energéticas para hogares y pequeños negocios. Nuestra experiencia combina tecnología, implementación técnica y acompañamiento especializado, para desarrollar soluciones adaptadas a diferentes necesidades energéticas — de vender equipos a resolver necesidades energéticas críticas.',
  positioning:
    'Para empresas, instituciones y personas que buscan mejorar su eficiencia energética, Inversiones ICR desarrolla soluciones tecnológicas de energía solar y respaldo energético mediante ingeniería especializada, equipos confiables y soporte permanente.',
}

export const contact = {
  phoneDisplay: '+51 999 999 999',
  phoneWhatsapp: '51999999999', // TODO: reemplazar con el número real de WhatsApp
  email: 'contacto@inversionesicr.pe', // TODO: confirmar correo real
  address: 'Arequipa, Perú', // TODO: confirmar dirección exacta
  facebook: 'https://facebook.com/inversionesicr',
  instagram: 'https://instagram.com/inversionesicr',
}

export const whatsappLink = (message = 'Hola, quiero más información sobre las soluciones energéticas de Inversiones ICR.') =>
  `https://wa.me/${contact.phoneWhatsapp}?text=${encodeURIComponent(message)}`

export const navLinks = [
  { label: 'Nosotros', to: '/nosotros' },
  {
    label: 'Sectores',
    to: '/sectores',
    children: [
      { label: 'Minería', to: '/sectores#mina' },
      { label: 'Industria', to: '/sectores#industria' },
      { label: 'Agricultura', to: '/sectores#agricultura' },
      { label: 'Textil', to: '/sectores#textil' },
      { label: 'Energía', to: '/sectores#energia' },
    ],
  },
  { label: 'Soluciones', to: '/soluciones' },
  { label: 'Experiencia', to: '/experiencia' },
  { label: 'Contacto', to: '/contacto' },
]

export const sectors = [
  {
    id: 'mina',
    name: 'Minería',
    icon: 'mina',
    description:
      'Sistemas energéticos de gran escala para operaciones mineras: generación solar, bancos de baterías y respaldo ininterrumpido que garantizan continuidad operativa 24/7.',
  },
  {
    id: 'industria',
    name: 'Industria',
    icon: 'industria',
    description:
      'Soluciones de eficiencia energética para plantas industriales, reduciendo costos operativos y dependencia de la red convencional.',
  },
  {
    id: 'agricultura',
    name: 'Agricultura',
    icon: 'agricultura',
    description:
      'Energía solar aplicada a bombeo, riego tecnificado y electrificación de zonas rurales, llevando continuidad energética al campo.',
  },
  {
    id: 'textil',
    name: 'Textil',
    icon: 'textil',
    description:
      'Sistemas fotovoltaicos para plantas de producción textil, optimizando el consumo energético del proceso productivo.',
  },
  {
    id: 'energia',
    name: 'Energía',
    icon: 'energia',
    description:
      'Proyectos de generación, respaldo e inyección a la red para el sector eléctrico, telecomunicaciones e instituciones sociales.',
  },
]

// Proyectos ejecutados — fuente: Proyectos_ICR.pdf
export const projects = [
  {
    id: 'mina-quellaveco',
    title: 'Mina Quellaveco — Anglo American',
    client: 'Anglo American',
    location: 'Moquegua, Perú',
    sector: 'mina',
    // Imágenes referenciales de instalaciones ICR (no del sitio de Quellaveco,
    // que no tiene fotografía propia todavía).
    images: ['/images/projects/mina-quellaveco-1.jpg', '/images/projects/mina-quellaveco-2.jpg'],
    featured: true,
    hito: true,
    summary:
      'Proyecto de gran envergadura: 600 paneles solares y un banco de baterías de 560 kWh que reducen 584 toneladas de CO₂ al año.',
    description:
      'Inversiones ICR ejecutó un proyecto de gran envergadura en la mina Quellaveco, propiedad de Anglo American, ubicada en Moquegua. Se instalaron 600 paneles solares y un banco de baterías de 560 kWh en el depósito de activos de la operación minera, logrando reducir 584 toneladas de CO₂ anuales. Además, se implementó un carport solar con 50 paneles adicionales y un sistema en el almacén central que reemplaza generadores diésel, eliminando el consumo de combustible fósil en dichas áreas. Asimismo, se colocaron 126 baterías que suministran energía como sistema de alimentación ininterrumpida (SAI), garantizando la continuidad operativa ante cualquier eventualidad en la red eléctrica. Este proyecto posiciona a Quellaveco como un referente en minería sostenible en el Perú.',
    stats: [
      { label: 'Paneles solares', value: '650+' },
      { label: 'Banco de baterías', value: '560 kWh' },
      { label: 'CO₂ reducido / año', value: '584 t' },
      { label: 'Baterías SAI', value: '126' },
    ],
  },
  {
    id: 'sauna-adan-eva',
    title: 'Sauna Adán y Eva',
    client: 'Sauna Adán y Eva',
    location: 'Tacna, Perú',
    sector: 'industria',
    images: ['/images/projects/sauna-adan-eva-1.jpg', '/images/projects/sauna-adan-eva-2.jpg'],
    featured: true,
    hito: true,
    summary:
      'Instalación de 32 paneles solares que cubren cerca del 40% del consumo eléctrico del centro de bienestar.',
    description:
      'Inversiones ICR ejecutó la instalación de 32 paneles solares fotovoltaicos para el centro de relajación Sauna Adán y Eva, ubicado en la ciudad de Tacna. Este sistema de energía limpia abastece parte de la demanda eléctrica de sus modernas instalaciones, que incluyen baño turco, duchas españolas, piscina, jacuzzi con hidromasajes y cromoterapia con pediluvio. Gracias a este proyecto, el reconocido centro de bienestar integra el uso de energías renovables a su oferta de servicios, reduciendo su huella de carbono y apostando por la sostenibilidad ambiental. La capacidad instalada permite cubrir aproximadamente el 40% del consumo energético del local, generando ahorros significativos en la factura eléctrica y contribuyendo a la lucha contra el cambio climático.',
    stats: [
      { label: 'Paneles instalados', value: '32' },
      { label: 'Consumo cubierto', value: '~40%' },
    ],
  },
  {
    id: 'pozo-negro',
    title: 'Pozo Negro',
    client: 'Pozo Negro',
    location: 'Arequipa, Perú',
    sector: 'industria',
    // Imágenes referenciales de instalaciones ICR en Arequipa (sin foto propia del sitio).
    images: ['/images/projects/pozo-negro-1.jpg', '/images/projects/pozo-negro-2.jpg'],
    featured: false,
    hito: false,
    summary:
      'Sistema fotovoltaico con baterías de litio para garantizar el suministro energético en operaciones de bombeo y extracción.',
    description:
      'En el proyecto Pozo Negro, ubicado en la región de Arequipa, se realizó una instalación fotovoltaica compuesta por 15 paneles solares de alta eficiencia, acompañados de un inversor-cargador, un transformador y 2 baterías de litio de última generación. Este sistema está diseñado para garantizar el suministro energético en operaciones de bombeo y extracción, mejorando la autonomía y reduciendo la dependencia de combustibles fósiles. La solución implementada asegura un respaldo energético confiable, incluso en zonas sin acceso estable a la red eléctrica, lo que optimiza la productividad y la continuidad operativa del cliente.',
    stats: [
      { label: 'Paneles de alta eficiencia', value: '15' },
      { label: 'Baterías de litio', value: '2' },
    ],
  },
  {
    id: 'kleinfor',
    title: 'Kleinfor',
    client: 'Kleinfor',
    location: 'Cayma, Arequipa, Perú',
    sector: 'textil',
    images: ['/images/projects/kleinfor-1.jpg', '/images/projects/kleinfor-2.jpg'],
    featured: true,
    hito: true,
    summary:
      'Energía solar para una planta textil, generando cerca de 18,000 kWh al año — equivalente a sembrar más de 800 árboles.',
    description:
      'Inversiones ICR ejecutó la instalación de paneles solares fotovoltaicos en la planta textil Kleinfor, fabricante de camisas, blusas y pantalones en el distrito de Cayma, Arequipa. Este sistema de energía renovable permite cubrir parte de la demanda eléctrica de su proceso productivo, reforzando la eficiencia energética y reduciendo la huella de carbono de la empresa. Con esta iniciativa, Kleinfor se posiciona como un actor comprometido con la sostenibilidad en el sector textil, disminuyendo sus costos operativos y cumpliendo con estándares ambientales cada vez más exigentes. La instalación consta de una potencia pico que genera alrededor de 18,000 kWh al año, equivalentes a la siembra de más de 800 árboles.',
    stats: [
      { label: 'Generación anual', value: '18,000 kWh' },
      { label: 'Equivalente en árboles', value: '800+' },
    ],
  },
  {
    id: 'super-sport',
    title: 'Super Sport',
    client: 'Super Sport',
    location: 'Puerto Maldonado, Perú',
    sector: 'textil',
    images: ['/images/projects/super-sport-1.jpg'],
    featured: false,
    hito: false,
    summary:
      'Inversor GOODWE y 8 paneles solares que estabilizan el suministro eléctrico de la tienda en la Amazonía.',
    description:
      'Para la tienda deportiva Super Sport, ubicada en Puerto Maldonado, se realizó una instalación de un inversor GOODWE de alta eficiencia y 8 paneles solares fotovoltaicos. Este sistema proporciona energía limpia para iluminación y equipos electrónicos, reduciendo el consumo de la red convencional y los costos asociados. La solución ha permitido al establecimiento mantener un suministro estable en una zona con frecuentes fluctuaciones eléctricas, mejorando la experiencia del cliente y reforzando el compromiso de la empresa con el medio ambiente en la región amazónica.',
    stats: [
      { label: 'Paneles solares', value: '8' },
      { label: 'Inversor', value: 'GOODWE' },
    ],
  },
  {
    id: 'radio-primavera',
    title: 'Radio Primavera',
    client: 'Radio Primavera',
    location: 'Moquegua, Perú',
    sector: 'energia',
    images: ['/images/projects/radio-primavera-1.jpg'],
    featured: false,
    hito: false,
    summary:
      'Sistema Victron y paneles Smart Solar que garantizan la continuidad del servicio radial en horas de baja irradiación.',
    description:
      'En la localidad de Moquegua, Inversiones ICR realizó la instalación de un sistema de energía solar para Radio Primavera, compuesto por un inversor VICTRON MultiPlus II, un regulador MPPT y dos paneles Smart Solar. Esta configuración permite aprovechar al máximo la radiación solar de la zona, garantizando una alimentación eléctrica estable y eficiente para los equipos de transmisión y operación de la emisora. El sistema asegura la continuidad del servicio radial, incluso en horas de menor irradiación, gracias a la gestión inteligente de la energía y la capacidad de respaldo del inversor.',
    stats: [
      { label: 'Inversor', value: 'Victron MultiPlus II' },
      { label: 'Paneles Smart Solar', value: '2' },
    ],
  },
  {
    id: 'seal',
    title: 'SEAL — Sociedad Eléctrica de Arequipa',
    client: 'SEAL',
    location: 'Jesús, Arequipa, Perú',
    sector: 'energia',
    images: ['/images/projects/seal-1.jpg', '/images/projects/seal-2.jpg', '/images/projects/seal-3.jpg'],
    featured: true,
    hito: false,
    summary:
      '114 paneles fotovoltaicos (46.17 kW) que abastecen una subestación e inyectan el excedente al SEIN.',
    description:
      'Proyecto ejecutado por Inversiones ICR para la Sociedad Eléctrica de Arequipa (SEAL), con la instalación de 114 paneles fotovoltaicos que suman una potencia de 46.17 kW. Este sistema abastece de manera autosostenible la subestación de transformación del sector de Jesús, en Arequipa. El excedente de energía generada se inyecta al Sistema Eléctrico Interconectado Nacional (SEIN), consolidando el liderazgo de la región en energías renovables. Esta iniciativa no solo reduce la huella de carbono de la subestación, sino que también contribuye a la matriz energética nacional, demostrando el compromiso de SEAL con la innovación y la sostenibilidad.',
    stats: [
      { label: 'Paneles fotovoltaicos', value: '114' },
      { label: 'Potencia instalada', value: '46.17 kW' },
    ],
  },
  {
    id: 'ong-desco',
    title: 'ONG DESCO',
    client: 'Centro de Estudios y Promoción del Desarrollo',
    location: 'Puquio, Ayacucho, Perú',
    sector: 'energia',
    images: ['/images/projects/ong-desco-1.jpg', '/images/projects/ong-desco-2.jpg'],
    featured: true,
    hito: true,
    summary:
      'Sistema solar comunitario que lleva energía limpia a instituciones educativas, beneficiando a más de 200 estudiantes.',
    description:
      'En coordinación con la ONG DESCO, Inversiones ICR implementó un sistema solar compuesto por 20 paneles fotovoltaicos en la ciudad de Puquio, Ayacucho. Este proyecto se orienta a brindar energía renovable a instituciones educativas y espacios comunitarios, reforzando el desarrollo local y reduciendo la dependencia de fuentes energéticas convencionales. La iniciativa se enmarca en los esfuerzos por llevar energía limpia a zonas rurales del Perú, apoyando la educación, la salud y el bienestar de las familias. El sistema genera aproximadamente 10,000 kWh al año, beneficiando directamente a más de 200 estudiantes y a la comunidad en general, mejorando las condiciones de estudio y promoviendo el uso responsable de los recursos naturales.',
    stats: [
      { label: 'Paneles fotovoltaicos', value: '20' },
      { label: 'Generación anual', value: '10,000 kWh' },
      { label: 'Estudiantes beneficiados', value: '200+' },
    ],
  },
]

// El documento fuente no incluye un proyecto de agricultura específico;
// se muestra contenido genérico de sector a la espera de un caso documentado.
export const agricultureGeneric = {
  sector: 'agricultura',
  title: 'Soluciones solares para el agro',
  summary:
    'Sistemas de bombeo y riego tecnificado alimentados por energía solar, pensados para llevar continuidad energética a zonas rurales y operaciones agrícolas alejadas de la red eléctrica.',
  description:
    'Aplicando la misma ingeniería que respalda nuestros proyectos de bombeo y extracción en minería e industria, desarrollamos soluciones fotovoltaicas para riego tecnificado y electrificación de operaciones agrícolas, reduciendo la dependencia de combustibles fósiles y asegurando continuidad operativa en campo.',
  image: '/images/sectors/agricultura.jpg',
  isGeneric: true,
}

export const projectsBySector = (sectorId) => projects.filter((p) => p.sector === sectorId)

export const featuredProjects = projects.filter((p) => p.featured)
export const hitos = projects.filter((p) => p.hito)

// Valores de marca — construidos a partir del arquetipo (El Sabio/Ingeniero,
// El Protector) y las características humanas descritas en el documento de marca.
export const values = [
  {
    id: 'ingenieria',
    title: 'Ingeniería y precisión',
    summary:
      'No solo instalamos: analizamos, diseñamos y ejecutamos soluciones adaptadas a cada necesidad energética.',
    meaning:
      'Para nosotros significa que cada proyecto empieza con un diagnóstico técnico real, nunca con una plantilla genérica.',
  },
  {
    id: 'confiabilidad',
    title: 'Confiabilidad y respaldo',
    summary:
      'Trabajamos con equipos de alto desempeño y marcas confiables para reducir fallas y aumentar la vida útil de los sistemas.',
    meaning:
      'Para nosotros significa ser el respaldo energético de proyectos que no pueden detenerse, sin importar el sector.',
  },
  {
    id: 'innovacion',
    title: 'Innovación tecnológica',
    summary:
      'Aplicamos tecnología de punta en generación, almacenamiento y gestión inteligente de energía.',
    meaning:
      'Para nosotros significa evolucionar constantemente para ofrecer soluciones cada vez más eficientes.',
  },
  {
    id: 'acompanamiento',
    title: 'Acompañamiento permanente',
    summary:
      'El cliente no queda solo después de la implementación: brindamos soporte y seguimiento continuo.',
    meaning:
      'Para nosotros significa construir relaciones de largo plazo, no solo instalar sistemas.',
  },
]

export const differentiators = [
  {
    title: 'Ingeniería y experiencia técnica',
    description: 'Analizamos, diseñamos y ejecutamos soluciones adaptadas a cada necesidad.',
  },
  {
    title: 'Calidad de componentes',
    description:
      'Trabajamos con equipos de alto desempeño y marcas confiables para reducir fallas y aumentar la vida útil de los sistemas.',
  },
  {
    title: 'Estándar industrial',
    description:
      'Nuestra experiencia permite desarrollar proyectos con criterios de seguridad, precisión y exigencia técnica.',
  },
  {
    title: 'Acompañamiento permanente',
    description:
      'Brindamos soporte y seguimiento para mantener la eficiencia del sistema después de la implementación.',
  },
]

export const history = {
  intro:
    'Inversiones ICR nace desde una necesidad concreta: llevar soluciones energéticas de calidad a clientes que requieren mejorar su eficiencia, reducir costos y contar con sistemas confiables incluso en contextos donde la energía representa una limitación.',
  trayectoria:
    'Desde nuestros primeros proyectos, evolucionamos de la comercialización de componentes energéticos hacia el desarrollo integral de soluciones: ingeniería aplicada, selección de componentes, instalación, respaldo energético y acompañamiento postventa. Hoy trabajamos en dos frentes: proyectos B2B para industrias, minería, instituciones públicas y organizaciones con necesidades críticas de continuidad energética, y soluciones B2C con kits solares para hogares y pequeños negocios en todo el Perú.',
}

export const faqs = [
  {
    q: '¿Qué tipos de soluciones energéticas ofrece Inversiones ICR?',
    a: 'Diseñamos e instalamos sistemas fotovoltaicos, bancos de baterías, sistemas de respaldo energético (SAI), carports solares y soluciones de bombeo solar, adaptados a proyectos industriales, mineros, agrícolas, textiles, energéticos y residenciales.',
  },
  {
    q: '¿Trabajan solo con grandes empresas o también con hogares?',
    a: 'Trabajamos en dos frentes: proyectos B2B para industrias, minería, instituciones públicas y gobiernos, y soluciones B2C con kits solares accesibles para hogares y pequeños negocios.',
  },
  {
    q: '¿En qué zonas del Perú trabajan?',
    a: 'Tenemos proyectos ejecutados en Tacna, Arequipa, Moquegua, Puerto Maldonado y Ayacucho, y contamos con capacidad para operar en todo el territorio nacional.',
  },
  {
    q: '¿Cuánto puedo ahorrar al instalar un sistema solar?',
    a: 'El ahorro depende del consumo actual y la capacidad instalada. En proyectos como Sauna Adán y Eva, el sistema cubre cerca del 40% del consumo eléctrico, generando ahorros significativos en la factura.',
  },
  {
    q: '¿Cuánto tiempo toma instalar un sistema fotovoltaico?',
    a: 'El tiempo varía según la envergadura del proyecto: instalaciones residenciales o de pequeños negocios pueden tomar pocos días, mientras que proyectos industriales o mineros de gran escala requieren una planificación técnica más extensa.',
  },
  {
    q: '¿Los sistemas solares funcionan en días nublados?',
    a: 'Sí. Los paneles siguen generando energía con luz difusa, aunque con menor eficiencia. Por eso muchos de nuestros proyectos incluyen baterías o respaldo para garantizar continuidad incluso en condiciones de baja irradiación.',
  },
  {
    q: '¿Necesito baterías para mi sistema solar?',
    a: 'Depende de tu objetivo: si buscas autonomía total o respaldo ante cortes, recomendamos baterías. Si solo buscas reducir tu consumo de red, un sistema conectado a la red (on-grid) puede ser suficiente.',
  },
  {
    q: '¿Qué garantía tienen los equipos instalados?',
    a: 'Trabajamos con marcas de alto desempeño (Victron, GOODWE, entre otras) que cuentan con garantía de fábrica, y realizamos seguimiento técnico postventa para asegurar su correcto funcionamiento.',
  },
  {
    q: '¿Ofrecen mantenimiento después de la instalación?',
    a: 'Sí. El acompañamiento permanente es uno de nuestros diferenciadores: brindamos soporte y seguimiento técnico para mantener la eficiencia del sistema a lo largo del tiempo.',
  },
  {
    q: '¿Pueden diseñar soluciones para operaciones mineras de gran escala?',
    a: 'Sí, contamos con experiencia en proyectos de gran envergadura, como la instalación de más de 600 paneles solares y bancos de baterías en la mina Quellaveco de Anglo American.',
  },
  {
    q: '¿Qué pasa si se corta el suministro eléctrico de la red?',
    a: 'Nuestros sistemas de respaldo (SAI) y bancos de baterías garantizan la continuidad operativa ante cortes o fallas de la red eléctrica, tal como implementamos en proyectos mineros e industriales.',
  },
  {
    q: '¿Puedo inyectar el excedente de energía a la red?',
    a: 'Sí, dependiendo del proyecto y la normativa vigente. En el proyecto SEAL, por ejemplo, el excedente de energía generado se inyecta al Sistema Eléctrico Interconectado Nacional (SEIN).',
  },
  {
    q: '¿Cómo empiezo a trabajar con Inversiones ICR?',
    a: 'El primer paso es contarnos tu necesidad energética a través de nuestro formulario de contacto o WhatsApp. Nuestro equipo técnico evalúa tu caso y te propone una solución adaptada.',
  },
]
