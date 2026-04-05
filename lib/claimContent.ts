import {
  BadgeAlert,
  Bandage,
  Ban,
  Banknote,
  BedDouble,
  Briefcase,
  Building2,
  Camera,
  Car,
  CarFront,
  CircleHelp,
  ClipboardList,
  Clock3,
  CloudFog,
  CloudLightning,
  CreditCard,
  DoorOpen,
  FileSignature,
  FileText,
  FireExtinguisher,
  Flame,
  Hand,
  Handshake,
  Hash,
  Hospital,
  House,
  IdCard,
  Laptop,
  Lock,
  LockKeyhole,
  Mail,
  Mic,
  Navigation,
  NotebookPen,
  Package,
  PaintBucket,
  Phone,
  Plug,
  Receipt,
  Route,
  ShieldAlert,
  Smartphone,
  Sofa,
  Trash2,
  TriangleAlert,
  Waves,
  Zap,
} from "lucide-react";
import claimVideos from "@/data/claim-videos.json";
import type { Language, LocalizedText } from "@/lib/types";
import type {
  ClaimGuide,
  ClaimGuidePersonalization,
  ClaimProgressState,
  ClaimStep,
  DocumentItem,
  DoDontItem,
  EvidenceItem,
  IncidentCategory,
  IncidentType,
} from "@/types/claim";

interface ClaimVideosData {
  statefarmLinks: {
    fileClaim: string;
    autoClaims: string;
    homeClaims: string;
    phone: string;
    appIos: string;
    appAndroid: string;
  };
}

interface LocalizedClaimStep extends Omit<ClaimStep, "title" | "description" | "timeframe" | "details" | "warning" | "completed"> {
  title: LocalizedText;
  description: LocalizedText;
  timeframe: LocalizedText;
  details: LocalizedText[];
  warning?: LocalizedText;
}

interface LocalizedEvidenceItem extends Omit<EvidenceItem, "label" | "description" | "tips" | "captured"> {
  label: LocalizedText;
  description: LocalizedText;
  tips: LocalizedText;
}

interface LocalizedDoDontItem extends Omit<DoDontItem, "text" | "explanation"> {
  text: LocalizedText;
  explanation: LocalizedText;
}

interface LocalizedDocumentItem extends Omit<DocumentItem, "label" | "description" | "where_to_find" | "collected"> {
  label: LocalizedText;
  description: LocalizedText;
  where_to_find: LocalizedText;
}

interface LocalizedIncidentCategory extends Omit<IncidentCategory, "label" | "sublabel"> {
  label: LocalizedText;
  sublabel: LocalizedText;
}

interface LocalizedGuideTemplate {
  incidentType: IncidentType;
  urgencyLevel: "immediate" | "within_24h" | "within_week";
  urgencyMessage: LocalizedText;
  estimatedTimeline: LocalizedText;
  stateFarmClaimUrl: string;
  steps: LocalizedClaimStep[];
  evidence: LocalizedEvidenceItem[];
  dos: LocalizedDoDontItem[];
  donts: LocalizedDoDontItem[];
  documents: LocalizedDocumentItem[];
}

const stateFarmLinks = (claimVideos as ClaimVideosData).statefarmLinks;

export const CLAIM_PROGRESS_STORAGE_KEY = "arrivesafe-claim-progress-v1";
export const CLAIM_VIDEO_ID = "QoVyaoIcJvQ";

function localize(en: string, es: string): LocalizedText {
  return { en, es };
}

function pickText(language: Language, value: LocalizedText) {
  return value[language];
}

function mapProgress(progress?: Partial<ClaimProgressState>): ClaimProgressState {
  return {
    completedStepIds: progress?.completedStepIds ?? [],
    collectedDocumentIds: progress?.collectedDocumentIds ?? [],
    capturedEvidenceIds: progress?.capturedEvidenceIds ?? [],
  };
}

const INCIDENT_CATEGORIES: LocalizedIncidentCategory[] = [
  {
    type: "car_accident",
    icon: CarFront,
    label: localize("Car accident", "Choque de auto"),
    sublabel: localize("Collision or hit", "Colision o golpe"),
    color: "bg-red-50 border-red-200",
    urgency: "immediate",
  },
  {
    type: "apartment_flood",
    icon: Waves,
    label: localize("Water damage", "Dano por agua"),
    sublabel: localize("Flood or pipe burst", "Inundacion o tuberia rota"),
    color: "bg-blue-50 border-blue-200",
    urgency: "immediate",
  },
  {
    type: "theft",
    icon: LockKeyhole,
    label: localize("Theft / Break-in", "Robo / Entrada forzada"),
    sublabel: localize("Stolen property", "Propiedad robada"),
    color: "bg-amber-50 border-amber-200",
    urgency: "within_24h",
  },
  {
    type: "fire",
    icon: Flame,
    label: localize("Fire damage", "Dano por incendio"),
    sublabel: localize("Fire or smoke", "Fuego o humo"),
    color: "bg-orange-50 border-orange-200",
    urgency: "immediate",
  },
  {
    type: "weather_damage",
    icon: CloudLightning,
    label: localize("Storm damage", "Dano por tormenta"),
    sublabel: localize("Wind, hail, lightning", "Viento, granizo, rayos"),
    color: "bg-violet-50 border-violet-200",
    urgency: "within_24h",
  },
  {
    type: "other",
    icon: ClipboardList,
    label: localize("Something else", "Algo mas"),
    sublabel: localize("Describe below", "Describe abajo"),
    color: "bg-stone-50 border-stone-200",
    urgency: "within_week",
  },
];

const GUIDE_TEMPLATES: Record<IncidentType, LocalizedGuideTemplate> = {
  car_accident: {
    incidentType: "car_accident",
    urgencyLevel: "immediate",
    urgencyMessage: localize(
      "Act now — document everything before leaving the scene.",
      "Actua ahora: documenta todo antes de irte del lugar.",
    ),
    estimatedTimeline: localize("Typical resolution: 2 to 4 weeks", "Resolucion tipica: 2 a 4 semanas"),
    stateFarmClaimUrl: stateFarmLinks.autoClaims,
    steps: [
      {
        id: "safety",
        order: 1,
        title: localize("Check for injuries", "Revisa si hay lesiones"),
        description: localize(
          "Make sure everyone is safe. Call 911 if anyone is hurt.",
          "Asegurate de que todos esten seguros. Llama al 911 si alguien esta herido.",
        ),
        icon: ShieldAlert,
        urgency: "now",
        timeframe: localize("Right now", "Ahora mismo"),
        details: [
          localize("Check yourself and your passengers first.", "Revisate a ti y a tus pasajeros primero."),
          localize("Check the other driver and their passengers.", "Revisa al otro conductor y a sus pasajeros."),
          localize("If anyone is hurt, call 911 immediately.", "Si alguien esta herido, llama al 911 de inmediato."),
          localize(
            "Do not move injured people unless there is immediate danger.",
            "No muevas a las personas heridas a menos que haya peligro inmediato.",
          ),
        ],
        warning: localize(
          "Your safety matters more than any insurance claim.",
          "Tu seguridad importa mas que cualquier reclamo.",
        ),
      },
      {
        id: "scene",
        order: 2,
        title: localize("Secure the scene", "Asegura el lugar"),
        description: localize(
          "Turn on hazard lights and move out of traffic if it is safe.",
          "Enciende las luces intermitentes y sal del trafico si es seguro.",
        ),
        icon: TriangleAlert,
        urgency: "now",
        timeframe: localize("Right now", "Ahora mismo"),
        details: [
          localize("Turn on hazard lights immediately.", "Enciende las intermitentes de inmediato."),
          localize("If the car can move, pull to the shoulder or a parking lot.", "Si el auto se puede mover, ve al hombro o a un estacionamiento."),
          localize(
            "If the car cannot move, stay buckled until help arrives.",
            "Si el auto no se puede mover, quedate con el cinturon puesto hasta que llegue ayuda.",
          ),
          localize("Use warning triangles or flares if you have them.", "Usa triangulos o bengalas si los tienes."),
        ],
      },
      {
        id: "police",
        order: 3,
        title: localize("Call the police", "Llama a la policia"),
        description: localize(
          "Always file a police report. You will likely need it for the claim.",
          "Siempre haz un reporte policial. Lo mas probable es que lo necesites para el reclamo.",
        ),
        icon: BadgeAlert,
        urgency: "now",
        timeframe: localize("Right now", "Ahora mismo"),
        details: [
          localize("Call 911 or your local non-emergency line.", "Llama al 911 o al numero local que no sea de emergencia."),
          localize("Get the officer name, badge number, and report number.", "Pide el nombre del oficial, su placa y el numero del reporte."),
          localize("Ask when and where you can get the report.", "Pregunta cuando y donde puedes conseguir el reporte."),
        ],
        warning: localize(
          "Without a police report, the claim can become much harder.",
          "Sin un reporte policial, el reclamo se puede volver mucho mas dificil.",
        ),
      },
      {
        id: "evidence",
        order: 4,
        title: localize("Take photos of everything", "Toma fotos de todo"),
        description: localize(
          "Photos are the strongest proof you can collect.",
          "Las fotos son la prueba mas fuerte que puedes reunir.",
        ),
        icon: Camera,
        urgency: "now",
        timeframe: localize("Right now", "Ahora mismo"),
        details: [
          localize("Take wide and close shots of both cars.", "Toma fotos amplias y de cerca de ambos autos."),
          localize("Capture both license plates clearly.", "Captura ambas placas claramente."),
          localize("Photograph road signs, skid marks, and traffic lights.", "Fotografia las senales, marcas de frenado y semaforos."),
          localize("Photograph the other driver insurance card and license.", "Fotografia la tarjeta de seguro y licencia del otro conductor."),
          localize("Document visible injuries if they exist.", "Documenta lesiones visibles si existen."),
        ],
      },
      {
        id: "exchange",
        order: 5,
        title: localize("Exchange information", "Intercambia informacion"),
        description: localize(
          "Collect the other driver details and give yours calmly.",
          "Consigue los datos del otro conductor y da los tuyos con calma.",
        ),
        icon: Handshake,
        urgency: "now",
        timeframe: localize("At the scene", "En el lugar"),
        details: [
          localize("Get full name, phone number, and plate number.", "Consigue nombre completo, telefono y numero de placa."),
          localize("Get insurance company and policy number.", "Consigue la compania de seguro y el numero de poliza."),
          localize("Get the make, model, and color of the car.", "Consigue marca, modelo y color del auto."),
          localize("Ask witnesses for contact info if they saw it happen.", "Pide el contacto de testigos si vieron lo que paso."),
        ],
      },
      {
        id: "file_claim",
        order: 6,
        title: localize("File your claim", "Presenta tu reclamo"),
        description: localize(
          "Call State Farm or file online as soon as possible.",
          "Llama a State Farm o presenta en linea lo antes posible.",
        ),
        icon: Phone,
        urgency: "soon",
        timeframe: localize("Within 1 hour", "Dentro de 1 hora"),
        details: [
          localize("Call 800-732-5246, available 24/7.", "Llama al 800-732-5246, disponible 24/7."),
          localize("Or file online at statefarm.com/claims.", "O presenta en linea en statefarm.com/claims."),
          localize("Have your policy number and photos ready.", "Ten listo tu numero de poliza y las fotos."),
          localize("Describe what happened in short, clear sentences.", "Describe lo que paso con frases cortas y claras."),
        ],
      },
      {
        id: "doctor",
        order: 7,
        title: localize("See a doctor", "Ve al medico"),
        description: localize(
          "Some injuries show up hours later, even if you feel fine now.",
          "Algunas lesiones aparecen horas despues, aunque ahora te sientas bien.",
        ),
        icon: Hospital,
        urgency: "soon",
        timeframe: localize("Within 24 hours", "Dentro de 24 horas"),
        details: [
          localize("Visit urgent care or your doctor within a day.", "Ve a urgencias o con tu medico dentro del dia."),
          localize("Say it is related to a car accident.", "Di que esta relacionado con un choque."),
          localize("Keep all records, discharge notes, and receipts.", "Guarda todos los registros, notas y recibos."),
        ],
      },
      {
        id: "followup",
        order: 8,
        title: localize("Track the claim", "Da seguimiento al reclamo"),
        description: localize(
          "Stay responsive so the adjuster does not have to chase you.",
          "Mantente al pendiente para que el ajustador no tenga que perseguirte.",
        ),
        icon: ClipboardList,
        urgency: "later",
        timeframe: localize("Ongoing", "Continuo"),
        details: [
          localize("Respond to adjuster requests within 24 hours.", "Responde a las solicitudes del ajustador dentro de 24 horas."),
          localize("Keep receipts for towing, rides, medical costs, and rentals.", "Guarda recibos de grua, viajes, gastos medicos y renta."),
          localize(
            "Do not sign anything you do not understand. Ask for translation.",
            "No firmes nada que no entiendas. Pide traduccion.",
          ),
        ],
      },
    ],
    evidence: [
      {
        id: "your_car",
        label: localize("Your car damage", "Dano de tu auto"),
        description: localize("All angles", "Todos los angulos"),
        icon: CarFront,
        required: true,
        tips: localize("Take wide shots and close-ups of every damaged area.", "Toma fotos amplias y de cerca de cada zona danada."),
      },
      {
        id: "other_car",
        label: localize("Other car damage", "Dano del otro auto"),
        description: localize("All angles", "Todos los angulos"),
        icon: Car,
        required: true,
        tips: localize("Include their license plate in at least one photo.", "Incluye su placa en por lo menos una foto."),
      },
      {
        id: "scene",
        label: localize("The scene", "El lugar"),
        description: localize("Road and signs", "Carretera y senales"),
        icon: Route,
        required: true,
        tips: localize("Show the lane, traffic lights, and street signs.", "Muestra el carril, los semaforos y las senales."),
      },
      {
        id: "plates",
        label: localize("License plates", "Placas"),
        description: localize("Both vehicles", "Ambos vehiculos"),
        icon: IdCard,
        required: true,
        tips: localize("Make sure the numbers are sharp and readable.", "Asegurate de que los numeros se lean claramente."),
      },
      {
        id: "their_info",
        label: localize("Their insurance", "Su seguro"),
        description: localize("Card or details", "Tarjeta o datos"),
        icon: CreditCard,
        required: true,
        tips: localize("Photograph the insurance card front and back.", "Fotografia la tarjeta de seguro por delante y por detras."),
      },
      {
        id: "injuries",
        label: localize("Any injuries", "Lesiones visibles"),
        description: localize("If applicable", "Si aplica"),
        icon: Bandage,
        required: false,
        tips: localize("Document visible bruising or cuts as soon as possible.", "Documenta golpes o cortadas visibles lo antes posible."),
      },
    ],
    dos: [
      {
        text: localize("Take photos before moving anything", "Toma fotos antes de mover algo"),
        explanation: localize(
          "Photos from the scene are the strongest evidence for your claim.",
          "Las fotos del lugar son la prueba mas fuerte para tu reclamo.",
        ),
        icon: Camera,
      },
      {
        text: localize("Call the police even for small crashes", "Llama a la policia aunque el choque parezca pequeno"),
        explanation: localize(
          "A report often speeds up the claim and protects you later.",
          "Un reporte suele acelerar el reclamo y te protege despues.",
        ),
        icon: BadgeAlert,
      },
      {
        text: localize("Exchange information calmly", "Intercambia informacion con calma"),
        explanation: localize(
          "Get their name, phone, insurance, and plate number. Give yours too.",
          "Consigue su nombre, telefono, seguro y placa. Da los tuyos tambien.",
        ),
        icon: Handshake,
      },
      {
        text: localize("Call your insurer right away", "Llama a tu seguro enseguida"),
        explanation: localize(
          "Quick reporting usually leads to a smoother claim.",
          "Reportar rapido suele llevar a un reclamo mas fluido.",
        ),
        icon: Phone,
      },
      {
        text: localize("See a doctor within 24 hours", "Ve al medico dentro de 24 horas"),
        explanation: localize(
          "Hidden injuries show up later. Records protect you.",
          "Algunas lesiones aparecen despues. Los registros te protegen.",
        ),
        icon: Hospital,
      },
      {
        text: localize("Keep every receipt", "Guarda cada recibo"),
        explanation: localize(
          "Towing, rides, rental car, and medical costs can matter.",
          "La grua, los viajes, el carro rentado y los gastos medicos pueden importar.",
        ),
        icon: Receipt,
      },
    ],
    donts: [
      {
        text: localize("Don't say 'it was my fault'", "No digas 'fue mi culpa'"),
        explanation: localize(
          "Fault is decided later. A polite apology can hurt your claim.",
          "La culpa se decide despues. Una disculpa por cortesia puede danar tu reclamo.",
        ),
        icon: Ban,
      },
      {
        text: localize("Don't sign anything at the scene", "No firmes nada en el lugar"),
        explanation: localize(
          "Let your insurer review any document before you sign it.",
          "Deja que tu seguro revise cualquier documento antes de firmarlo.",
        ),
        icon: FileSignature,
      },
      {
        text: localize("Don't accept cash to settle fast", "No aceptes efectivo para arreglarlo rapido"),
        explanation: localize(
          "Hidden injuries and extra damage can appear later.",
          "Lesiones ocultas y danos extra pueden aparecer despues.",
        ),
        icon: Banknote,
      },
      {
        text: localize("Don't post about it on social media", "No publiques sobre esto en redes sociales"),
        explanation: localize(
          "Posts and photos can be used against your claim.",
          "Publicaciones y fotos pueden usarse contra tu reclamo.",
        ),
        icon: Smartphone,
      },
      {
        text: localize("Don't give a recorded statement unprepared", "No des una declaracion grabada sin prepararte"),
        explanation: localize(
          "Talk to your own insurer first before speaking to theirs.",
          "Habla primero con tu aseguradora antes de hablar con la de ellos.",
        ),
        icon: Mic,
      },
      {
        text: localize("Don't wait to file", "No esperes para presentar"),
        explanation: localize(
          "Delay can slow down or complicate the claim.",
          "La demora puede hacer mas lento o dificil el reclamo.",
        ),
        icon: Clock3,
      },
    ],
    documents: [
      {
        id: "police_report",
        label: localize("Police report", "Reporte policial"),
        description: localize("Report number and officer name", "Numero de reporte y nombre del oficial"),
        required: true,
        where_to_find: localize(
          "Ask the officer at the scene or pick it up from the station in 3 to 5 business days.",
          "Pidelo al oficial en el lugar o recogelo en la estacion en 3 a 5 dias habiles.",
        ),
      },
      {
        id: "insurance_card",
        label: localize("Your insurance card", "Tu tarjeta de seguro"),
        description: localize("Policy number and contact info", "Numero de poliza y contacto"),
        required: true,
        where_to_find: localize(
          "In your glove box, wallet, or State Farm mobile app.",
          "En la guantera, cartera o app movil de State Farm.",
        ),
      },
      {
        id: "photos",
        label: localize("Scene photos", "Fotos del lugar"),
        description: localize("Damage, road, plates, injuries", "Danos, carretera, placas, lesiones"),
        required: true,
        where_to_find: localize(
          "Take these at the scene using the evidence collector above.",
          "Tomalas en el lugar usando el recolector de evidencia arriba.",
        ),
      },
      {
        id: "other_driver_info",
        label: localize("Other driver's info", "Informacion del otro conductor"),
        description: localize("Name, license, insurance, plate", "Nombre, licencia, seguro, placa"),
        required: true,
        where_to_find: localize(
          "Exchange it at the scene and photograph their card and license.",
          "Intercambiala en el lugar y fotografia su tarjeta y licencia.",
        ),
      },
      {
        id: "medical_records",
        label: localize("Medical records", "Registros medicos"),
        description: localize("If you visited a doctor", "Si fuiste al medico"),
        required: false,
        where_to_find: localize(
          "Request them from urgent care or your doctor and keep all receipts.",
          "Pidelos en urgencias o con tu medico y guarda todos los recibos.",
        ),
      },
      {
        id: "repair_estimate",
        label: localize("Repair estimate", "Estimado de reparacion"),
        description: localize("From a body shop or mechanic", "De un taller o mecanico"),
        required: false,
        where_to_find: localize(
          "Get one or two estimates from a local repair shop.",
          "Consigue uno o dos estimados de un taller local.",
        ),
      },
      {
        id: "receipts",
        label: localize("Related receipts", "Recibos relacionados"),
        description: localize("Towing, rental, medical, transport", "Grua, renta, medico, transporte"),
        required: false,
        where_to_find: localize(
          "Keep physical and digital copies of every expense linked to the crash.",
          "Guarda copias fisicas y digitales de cada gasto ligado al choque.",
        ),
      },
    ],
  },
  apartment_flood: {
    incidentType: "apartment_flood",
    urgencyLevel: "immediate",
    urgencyMessage: localize(
      "Act now — stop the water source if you can and protect your documents first.",
      "Actua ahora: si puedes, deten el agua y protege tus documentos primero.",
    ),
    estimatedTimeline: localize("Typical resolution: 1 to 3 weeks", "Resolucion tipica: 1 a 3 semanas"),
    stateFarmClaimUrl: stateFarmLinks.homeClaims,
    steps: [
      {
        id: "safety",
        order: 1,
        title: localize("Make the apartment safe", "Haz seguro el apartamento"),
        description: localize(
          "Avoid standing water near outlets or appliances.",
          "Evita el agua estancada cerca de enchufes o aparatos.",
        ),
        icon: Plug,
        urgency: "now",
        timeframe: localize("Right now", "Ahora mismo"),
        details: [
          localize("If water is near electricity, turn off the breaker only if safe.", "Si el agua esta cerca de electricidad, corta el breaker solo si es seguro."),
          localize("Move people and pets away from the flooded area.", "Mueve a personas y mascotas lejos del area inundada."),
          localize("Wear shoes and avoid touching soaked power cords.", "Usa zapatos y evita tocar cables mojados."),
        ],
        warning: localize("Electrical shock is the first danger here.", "El riesgo electrico es el primer peligro aqui."),
      },
      {
        id: "stop_source",
        order: 2,
        title: localize("Stop the water if possible", "Deten el agua si es posible"),
        description: localize(
          "Shut off the local valve or call maintenance immediately.",
          "Cierra la valvula local o llama a mantenimiento de inmediato.",
        ),
        icon: Waves,
        urgency: "now",
        timeframe: localize("Within 15 minutes", "Dentro de 15 minutos"),
        details: [
          localize("If it is a burst pipe, call the emergency maintenance line.", "Si es una tuberia rota, llama a mantenimiento de emergencia."),
          localize("Tell them water is actively entering your unit.", "Diles que el agua esta entrando activamente en tu unidad."),
          localize("Ask for a written maintenance ticket number.", "Pide un numero de reporte o ticket por escrito."),
        ],
      },
      {
        id: "move_items",
        order: 3,
        title: localize("Save documents and electronics", "Salva documentos y electronicos"),
        description: localize(
          "Move passports, visa papers, laptops, and chargers first.",
          "Mueve primero pasaportes, papeles de visa, laptops y cargadores.",
        ),
        icon: Briefcase,
        urgency: "now",
        timeframe: localize("Right now", "Ahora mismo"),
        details: [
          localize("Move immigration documents to a dry room immediately.", "Lleva de inmediato tus documentos migratorios a un cuarto seco."),
          localize("Unplug electronics only if your hands and the area are dry.", "Desconecta electronicos solo si tus manos y el area estan secas."),
          localize("Use towels or bins to lift items off the floor.", "Usa toallas o cajas para levantar cosas del piso."),
        ],
        warning: localize(
          "I-20s, passports, and visa paperwork take time to replace. Protect them first.",
          "I-20, pasaportes y papeles de visa toman tiempo en reemplazarse. Protegelos primero.",
        ),
      },
      {
        id: "photos",
        order: 4,
        title: localize("Document every damaged area", "Documenta cada area danada"),
        description: localize(
          "Take photos before cleanup starts.",
          "Toma fotos antes de que empiece la limpieza.",
        ),
        icon: Camera,
        urgency: "now",
        timeframe: localize("Before cleanup", "Antes de limpiar"),
        details: [
          localize("Photograph the ceiling, walls, floor, and any dripping source.", "Fotografia techo, paredes, piso y el origen del goteo."),
          localize("Take wide shots of each room and close shots of damaged items.", "Toma fotos amplias de cada cuarto y de cerca de cada dano."),
          localize("Include serial numbers when possible for electronics.", "Incluye numeros de serie cuando puedas en electronicos."),
        ],
      },
      {
        id: "landlord",
        order: 5,
        title: localize("Notify the landlord in writing", "Avisa al arrendador por escrito"),
        description: localize(
          "Send a message or email so there is a timestamp.",
          "Envia un mensaje o correo para que quede con fecha y hora.",
        ),
        icon: Building2,
        urgency: "soon",
        timeframe: localize("Within 1 hour", "Dentro de 1 hora"),
        details: [
          localize("Explain where the water came from and which rooms are affected.", "Explica de donde viene el agua y que cuartos fueron afectados."),
          localize("Ask when remediation or drying will begin.", "Pregunta cuando empezara el secado o remediacion."),
          localize("Keep screenshots of every message.", "Guarda capturas de cada mensaje."),
        ],
      },
      {
        id: "file_claim",
        order: 6,
        title: localize("File your renters claim", "Presenta tu reclamo de inquilino"),
        description: localize(
          "Call State Farm or file online once the damage is documented.",
          "Llama a State Farm o presenta en linea cuando el dano ya este documentado.",
        ),
        icon: Phone,
        urgency: "soon",
        timeframe: localize("Within 4 hours", "Dentro de 4 horas"),
        details: [
          localize("Tell them this is sudden water damage, not long-term neglect.", "Diles que es dano repentino por agua, no abandono de largo plazo."),
          localize("Upload photos, the maintenance ticket, and a first list of damaged items.", "Sube fotos, el ticket de mantenimiento y una primera lista de danos."),
          localize("Ask what temporary housing or drying costs may be covered.", "Pregunta que costos de vivienda temporal o secado podrian estar cubiertos."),
        ],
      },
      {
        id: "inventory",
        order: 7,
        title: localize("Build your item list", "Haz tu lista de objetos"),
        description: localize(
          "List each damaged item, when you bought it, and what it cost.",
          "Haz una lista de cada objeto danado, cuando lo compraste y cuanto costo.",
        ),
        icon: Receipt,
        urgency: "later",
        timeframe: localize("Same day", "Ese mismo dia"),
        details: [
          localize("Start with electronics, documents, clothes, and furniture.", "Empieza con electronicos, documentos, ropa y muebles."),
          localize("Search email receipts or online orders when you can.", "Busca recibos por correo o pedidos en linea cuando puedas."),
          localize("Keep damaged items until the adjuster says you can throw them out.", "Guarda los objetos danados hasta que el ajustador diga que ya puedes tirarlos."),
        ],
      },
    ],
    evidence: [
      {
        id: "source",
        label: localize("Water source", "Origen del agua"),
        description: localize("Pipe, ceiling, or wall", "Tuberia, techo o pared"),
        icon: Waves,
        required: true,
        tips: localize("Show where the leak started and how water is entering.", "Muestra donde empezo la fuga y como entra el agua."),
      },
      {
        id: "room",
        label: localize("Whole room", "Cuarto completo"),
        description: localize("Wide shot", "Foto amplia"),
        icon: House,
        required: true,
        tips: localize("Stand in a corner so the full room is visible.", "Parate en una esquina para que se vea todo el cuarto."),
      },
      {
        id: "documents",
        label: localize("Important documents", "Documentos importantes"),
        description: localize("Passport, visa, I-20", "Pasaporte, visa, I-20"),
        icon: FileText,
        required: true,
        tips: localize("Capture damage clearly but keep documents safe and dry.", "Muestra el dano con claridad pero manten los documentos seguros y secos."),
      },
      {
        id: "electronics",
        label: localize("Electronics", "Electronicos"),
        description: localize("Laptop, charger, phone", "Laptop, cargador, telefono"),
        icon: Laptop,
        required: true,
        tips: localize("Take a close shot of the item and a wider shot in the room.", "Toma una foto de cerca del objeto y otra amplia en el cuarto."),
      },
      {
        id: "furniture",
        label: localize("Furniture", "Muebles"),
        description: localize("Beds, sofa, shelves", "Camas, sofa, repisas"),
        icon: Sofa,
        required: false,
        tips: localize("Show water lines, swelling, or stains.", "Muestra lineas de agua, hinchazon o manchas."),
      },
      {
        id: "maintenance",
        label: localize("Maintenance notice", "Reporte a mantenimiento"),
        description: localize("Ticket or message", "Ticket o mensaje"),
        icon: Smartphone,
        required: false,
        tips: localize("Capture the maintenance message and any response times.", "Captura el mensaje a mantenimiento y los tiempos de respuesta."),
      },
    ],
    dos: [
      {
        text: localize("Move documents first", "Mueve documentos primero"),
        explanation: localize(
          "Passport, visa, and school or work papers take time to replace.",
          "Pasaporte, visa y papeles de escuela o trabajo tardan en reemplazarse.",
        ),
        icon: IdCard,
      },
      {
        text: localize("Take photos before cleaning", "Toma fotos antes de limpiar"),
        explanation: localize(
          "Cleanup destroys proof if you do it too early.",
          "La limpieza destruye prueba si la haces demasiado pronto.",
        ),
        icon: Camera,
      },
      {
        text: localize("Tell the landlord in writing", "Avisa al arrendador por escrito"),
        explanation: localize(
          "Written notice creates a timeline that helps the claim.",
          "El aviso por escrito crea una linea de tiempo que ayuda al reclamo.",
        ),
        icon: Mail,
      },
      {
        text: localize("List every damaged item", "Anota cada objeto danado"),
        explanation: localize(
          "Small things add up fast in a water loss.",
          "Las cosas pequenas suman rapido en una perdida por agua.",
        ),
        icon: Receipt,
      },
    ],
    donts: [
      {
        text: localize("Don't assume the landlord insurance covers your stuff", "No asumas que el seguro del arrendador cubre tus cosas"),
        explanation: localize(
          "Landlord insurance usually covers the building, not your belongings.",
          "El seguro del arrendador normalmente cubre el edificio, no tus pertenencias.",
        ),
        icon: Ban,
      },
      {
        text: localize("Don't throw damaged items away too early", "No tires los objetos danados demasiado pronto"),
        explanation: localize(
          "The adjuster may need to see them first.",
          "El ajustador puede necesitar verlos primero.",
        ),
        icon: Trash2,
      },
      {
        text: localize("Don't wait until tomorrow", "No lo dejes para manana"),
        explanation: localize(
          "Water damage gets worse by the hour.",
          "El dano por agua empeora cada hora.",
        ),
        icon: Clock3,
      },
    ],
    documents: [
      {
        id: "lease",
        label: localize("Lease agreement", "Contrato de renta"),
        description: localize("Unit number and landlord details", "Numero de unidad y datos del arrendador"),
        required: true,
        where_to_find: localize("Look in your email, leasing portal, or signed PDF copy.", "Buscalo en tu correo, portal del edificio o PDF firmado."),
      },
      {
        id: "maintenance_ticket",
        label: localize("Maintenance ticket", "Ticket de mantenimiento"),
        description: localize("Proof you reported the leak", "Prueba de que reportaste la fuga"),
        required: true,
        where_to_find: localize("Save the confirmation email, text, or portal screenshot.", "Guarda el correo, texto o captura del portal."),
      },
      {
        id: "item_list",
        label: localize("Damaged item list", "Lista de objetos danados"),
        description: localize("What was damaged and estimated cost", "Que se dano y costo estimado"),
        required: true,
        where_to_find: localize("Build it yourself from photos, receipts, and memory.", "Hazla tu mismo con fotos, recibos y memoria."),
      },
      {
        id: "photos",
        label: localize("Damage photos", "Fotos del dano"),
        description: localize("Source, room, items, documents", "Origen, cuarto, objetos, documentos"),
        required: true,
        where_to_find: localize("Capture them before cleanup starts.", "Tomalas antes de que empiece la limpieza."),
      },
      {
        id: "receipts",
        label: localize("Replacement receipts", "Recibos de reemplazo"),
        description: localize("Fans, hotel, essentials", "Ventiladores, hotel, articulos esenciales"),
        required: false,
        where_to_find: localize("Keep screenshots, emails, and printed receipts.", "Guarda capturas, correos y recibos impresos."),
      },
    ],
  },
  theft: {
    incidentType: "theft",
    urgencyLevel: "within_24h",
    urgencyMessage: localize(
      "File within 24 hours — theft claims move better when the police report comes first.",
      "Presenta dentro de 24 horas: los reclamos por robo avanzan mejor cuando el reporte policial va primero.",
    ),
    estimatedTimeline: localize("Typical resolution: 1 to 2 weeks", "Resolucion tipica: 1 a 2 semanas"),
    stateFarmClaimUrl: stateFarmLinks.homeClaims,
    steps: [
      {
        id: "safe_entry",
        order: 1,
        title: localize("Do not walk in alone", "No entres solo"),
        description: localize(
          "If the door is open or something feels wrong, step back and call police.",
          "Si la puerta esta abierta o algo se siente mal, alejate y llama a la policia.",
        ),
        icon: DoorOpen,
        urgency: "now",
        timeframe: localize("Right now", "Ahora mismo"),
        details: [
          localize("Do not touch the door, lock, or anything inside yet.", "No toques la puerta, la cerradura ni nada adentro todavia."),
          localize("Call 911 if you think someone may still be inside.", "Llama al 911 si crees que alguien todavia esta adentro."),
          localize("Wait in a safe public area if needed.", "Espera en un lugar publico seguro si hace falta."),
        ],
        warning: localize(
          "Your safety comes first. Property can be replaced.",
          "Tu seguridad va primero. La propiedad se puede reemplazar.",
        ),
      },
      {
        id: "police",
        order: 2,
        title: localize("File the police report", "Haz el reporte policial"),
        description: localize(
          "The police report is usually required for a theft claim.",
          "El reporte policial normalmente es obligatorio para un reclamo por robo.",
        ),
        icon: BadgeAlert,
        urgency: "now",
        timeframe: localize("Within 30 minutes", "Dentro de 30 minutos"),
        details: [
          localize("Tell the officer exactly what is missing.", "Dile al oficial exactamente que falta."),
          localize("Get the report number before they leave.", "Consigue el numero del reporte antes de que se vaya."),
          localize("Ask how to get the final report copy.", "Pregunta como conseguir la copia final del reporte."),
        ],
        warning: localize(
          "Without a police report, a theft claim may be denied.",
          "Sin un reporte policial, un reclamo por robo puede ser negado.",
        ),
      },
      {
        id: "photos",
        order: 3,
        title: localize("Photograph the break-in", "Fotografia la entrada forzada"),
        description: localize(
          "Take photos before cleanup or repairs.",
          "Toma fotos antes de limpiar o reparar.",
        ),
        icon: Camera,
        urgency: "now",
        timeframe: localize("Right now", "Ahora mismo"),
        details: [
          localize("Photograph the door, lock, windows, and every affected room.", "Fotografia la puerta, cerradura, ventanas y cada cuarto afectado."),
          localize("Take close-ups of damage and wide shots of the room.", "Toma fotos de cerca del dano y fotos amplias del cuarto."),
          localize("Photograph empty spots where stolen items used to be.", "Fotografia los espacios vacios donde estaban los objetos robados."),
        ],
      },
      {
        id: "list_items",
        order: 4,
        title: localize("Make a stolen item list", "Haz la lista de objetos robados"),
        description: localize(
          "Write down what was taken, when you got it, and its value.",
          "Anota que se llevaron, cuando lo obtuviste y cuanto vale.",
        ),
        icon: Receipt,
        urgency: "soon",
        timeframe: localize("Within 2 hours", "Dentro de 2 horas"),
        details: [
          localize("Start with laptop, phone, wallet, and school or work items.", "Empieza con laptop, telefono, cartera y cosas de escuela o trabajo."),
          localize("Search for receipts, order confirmations, or photos of the item.", "Busca recibos, confirmaciones de compra o fotos del objeto."),
          localize("Include brand, model, serial number, and estimated cost.", "Incluye marca, modelo, numero de serie y costo estimado."),
        ],
      },
      {
        id: "protect_identity",
        order: 5,
        title: localize("Protect cards and identity", "Protege tus tarjetas e identidad"),
        description: localize(
          "Freeze bank cards and replace IDs if your wallet was taken.",
          "Congela tarjetas bancarias y reemplaza IDs si se llevaron tu cartera.",
        ),
        icon: Lock,
        urgency: "soon",
        timeframe: localize("Same day", "Ese mismo dia"),
        details: [
          localize("Call your bank and lock debit or credit cards.", "Llama a tu banco y bloquea tarjetas de debito o credito."),
          localize("Change passwords if a laptop or phone was stolen.", "Cambia contrasenas si robaron una laptop o telefono."),
          localize("If immigration documents were taken, contact your school or employer adviser.", "Si se llevaron documentos migratorios, contacta a tu asesor de escuela o empleador."),
        ],
      },
      {
        id: "file_claim",
        order: 6,
        title: localize("File your renters claim", "Presenta tu reclamo de inquilino"),
        description: localize(
          "Share the police report number and your stolen item list.",
          "Comparte el numero del reporte policial y tu lista de objetos robados.",
        ),
        icon: Phone,
        urgency: "soon",
        timeframe: localize("Within 24 hours", "Dentro de 24 horas"),
        details: [
          localize("Upload photos of the break-in and missing-item list.", "Sube fotos de la entrada forzada y tu lista de faltantes."),
          localize("Ask how the deductible applies before replacing expensive items.", "Pregunta como aplica el deducible antes de reemplazar cosas caras."),
          localize("Save the claim number and adjuster name.", "Guarda el numero del reclamo y el nombre del ajustador."),
        ],
      },
    ],
    evidence: [
      {
        id: "entry_point",
        label: localize("Entry point", "Punto de entrada"),
        description: localize("Door or window", "Puerta o ventana"),
        icon: DoorOpen,
        required: true,
        tips: localize("Take one wide photo and one close photo of the damage.", "Toma una foto amplia y una foto de cerca del dano."),
      },
      {
        id: "room",
        label: localize("Affected room", "Cuarto afectado"),
        description: localize("Wide shot", "Foto amplia"),
        icon: House,
        required: true,
        tips: localize("Show the full room so the disruption is obvious.", "Muestra todo el cuarto para que el desorden sea obvio."),
      },
      {
        id: "missing_items",
        label: localize("Missing item spots", "Espacios vacios"),
        description: localize("Where things used to be", "Donde estaban las cosas"),
        icon: Package,
        required: true,
        tips: localize("Photograph desks, shelves, and drawers that were emptied.", "Fotografia escritorios, repisas y cajones que quedaron vacios."),
      },
      {
        id: "serials",
        label: localize("Serial numbers", "Numeros de serie"),
        description: localize("Boxes or old photos", "Cajas o fotos viejas"),
        icon: Hash,
        required: false,
        tips: localize("Use old setup photos or product boxes if the item is gone.", "Usa fotos viejas o cajas del producto si el objeto ya no esta."),
      },
      {
        id: "police_card",
        label: localize("Police report info", "Datos del reporte policial"),
        description: localize("Report number", "Numero de reporte"),
        icon: BadgeAlert,
        required: true,
        tips: localize("Capture the card, slip, or text with the report number.", "Captura la tarjeta, papel o mensaje con el numero del reporte."),
      },
    ],
    dos: [
      {
        text: localize("Call the police before cleaning up", "Llama a la policia antes de limpiar"),
        explanation: localize(
          "The police report is the backbone of a theft claim.",
          "El reporte policial es la base del reclamo por robo.",
        ),
        icon: BadgeAlert,
      },
      {
        text: localize("Take photos of the break-in first", "Primero toma fotos de la entrada forzada"),
        explanation: localize(
          "Damage to the door or window helps prove forced entry.",
          "El dano en la puerta o ventana ayuda a probar la entrada forzada.",
        ),
        icon: Camera,
      },
      {
        text: localize("Freeze cards and passwords fast", "Bloquea tarjetas y contrasenas rapido"),
        explanation: localize(
          "Identity and financial damage can spread after the theft.",
          "El dano de identidad y dinero puede crecer despues del robo.",
        ),
        icon: Lock,
      },
    ],
    donts: [
      {
        text: localize("Don't file insurance before the police report", "No presentes al seguro antes del reporte policial"),
        explanation: localize(
          "The insurer may ask for the police report number right away.",
          "La aseguradora puede pedir el numero del reporte de inmediato.",
        ),
        icon: Ban,
      },
      {
        text: localize("Don't touch everything first", "No toques todo primero"),
        explanation: localize(
          "You can disturb the scene before photos are taken.",
          "Puedes alterar la escena antes de tomar fotos.",
        ),
        icon: Hand,
      },
      {
        text: localize("Don't guess at stolen items", "No adivines los objetos robados"),
        explanation: localize(
          "Make the list carefully and update it as you verify details.",
          "Haz la lista con cuidado y actualizala cuando verifiques detalles.",
        ),
        icon: CircleHelp,
      },
    ],
    documents: [
      {
        id: "police_report",
        label: localize("Police report", "Reporte policial"),
        description: localize("Required for the theft claim", "Obligatorio para el reclamo por robo"),
        required: true,
        where_to_find: localize("Ask for the report number before the officer leaves.", "Pide el numero del reporte antes de que el oficial se vaya."),
      },
      {
        id: "stolen_item_list",
        label: localize("Stolen item list", "Lista de objetos robados"),
        description: localize("Item, value, serial number", "Objeto, valor, numero de serie"),
        required: true,
        where_to_find: localize("Build it from memory, receipts, photos, and emails.", "Hazla con memoria, recibos, fotos y correos."),
      },
      {
        id: "damage_photos",
        label: localize("Break-in photos", "Fotos de la entrada forzada"),
        description: localize("Door, window, room, missing items", "Puerta, ventana, cuarto, faltantes"),
        required: true,
        where_to_find: localize("Capture them before repairs or cleanup.", "Tomalas antes de reparar o limpiar."),
      },
      {
        id: "receipts",
        label: localize("Proof of ownership", "Prueba de propiedad"),
        description: localize("Receipts or old product photos", "Recibos o fotos viejas"),
        required: false,
        where_to_find: localize("Search email inboxes, order history, and cloud photos.", "Busca en correos, historial de compras y fotos en la nube."),
      },
    ],
  },
  fire: {
    incidentType: "fire",
    urgencyLevel: "immediate",
    urgencyMessage: localize(
      "Act now — leave the area, call 911, and do not re-enter until firefighters say it is safe.",
      "Actua ahora: sal del area, llama al 911 y no regreses hasta que bomberos diga que es seguro.",
    ),
    estimatedTimeline: localize("Typical resolution: 3 to 6 weeks", "Resolucion tipica: 3 a 6 semanas"),
    stateFarmClaimUrl: stateFarmLinks.homeClaims,
    steps: [
      {
        id: "exit",
        order: 1,
        title: localize("Get out and stay out", "Sal y no regreses"),
        description: localize(
          "Leave immediately and move everyone to a safe distance.",
          "Sal de inmediato y lleva a todos a una distancia segura.",
        ),
        icon: ShieldAlert,
        urgency: "now",
        timeframe: localize("Right now", "Ahora mismo"),
        details: [
          localize("Call 911 as soon as you are outside.", "Llama al 911 tan pronto estes afuera."),
          localize("Do not go back inside for belongings or documents.", "No regreses por cosas ni documentos."),
          localize("Count people and pets once you are outside.", "Cuenta personas y mascotas una vez afuera."),
        ],
        warning: localize("Smoke and structure damage can kill in minutes.", "El humo y el dano estructural pueden matar en minutos."),
      },
      {
        id: "firefighters",
        order: 2,
        title: localize("Work with firefighters", "Coordina con bomberos"),
        description: localize(
          "Share what room started the fire and if anything explosive is inside.",
          "Diles en que cuarto empezo el fuego y si hay algo explosivo adentro.",
        ),
        icon: FireExtinguisher,
        urgency: "now",
        timeframe: localize("At the scene", "En el lugar"),
        details: [
          localize("Mention gas, chemicals, batteries, or pets still inside.", "Menciona gas, quimicos, baterias o mascotas que sigan adentro."),
          localize("Ask for the incident number once the scene is stable.", "Pide el numero del incidente cuando la escena este estable."),
        ],
      },
      {
        id: "temporary_shelter",
        order: 3,
        title: localize("Find temporary shelter", "Busca refugio temporal"),
        description: localize(
          "If the unit is not livable, focus on somewhere safe to sleep tonight.",
          "Si la unidad no es habitable, enfocate en conseguir donde dormir esta noche.",
        ),
        icon: BedDouble,
        urgency: "soon",
        timeframe: localize("Within 1 hour", "Dentro de 1 hora"),
        details: [
          localize("Ask the fire department or landlord if the unit is safe to re-enter.", "Pregunta a bomberos o al arrendador si se puede volver a entrar."),
          localize("Keep receipts for hotel, meals, and emergency items.", "Guarda recibos de hotel, comida y articulos de emergencia."),
        ],
      },
      {
        id: "photos",
        order: 4,
        title: localize("Document damage after clearance", "Documenta danos despues de autorizacion"),
        description: localize(
          "Take photos only after the property is cleared for entry.",
          "Toma fotos solo despues de que autoricen la entrada.",
        ),
        icon: Camera,
        urgency: "soon",
        timeframe: localize("Same day", "Ese mismo dia"),
        details: [
          localize("Capture fire, smoke, soot, and water damage from firefighting.", "Captura dano por fuego, humo, hollin y agua de bomberos."),
          localize("Photograph each room and major item before moving anything.", "Fotografia cada cuarto y cada objeto importante antes de mover algo."),
        ],
      },
      {
        id: "claim",
        order: 5,
        title: localize("File the claim", "Presenta el reclamo"),
        description: localize(
          "Use the fire incident number, your photos, and your first inventory list.",
          "Usa el numero del incidente, tus fotos y tu primera lista de inventario.",
        ),
        icon: Phone,
        urgency: "soon",
        timeframe: localize("Within 4 hours", "Dentro de 4 horas"),
        details: [
          localize("Ask specifically about temporary housing or loss of use coverage.", "Pregunta especificamente por cobertura de vivienda temporal o perdida de uso."),
          localize("Keep every claim reference number in one place.", "Guarda cada numero de referencia del reclamo en un solo lugar."),
        ],
      },
      {
        id: "inventory",
        order: 6,
        title: localize("Build a room-by-room inventory", "Haz un inventario por cuarto"),
        description: localize(
          "List what burned, what has smoke damage, and what is soaked.",
          "Anota que se quemo, que tiene dano por humo y que quedo mojado.",
        ),
        icon: ClipboardList,
        urgency: "later",
        timeframe: localize("Within 24 hours", "Dentro de 24 horas"),
        details: [
          localize("Separate total loss items from salvageable ones.", "Separa perdida total de lo que aun se puede salvar."),
          localize("Use receipts, cloud photos, and emails to rebuild the list.", "Usa recibos, fotos en la nube y correos para reconstruir la lista."),
        ],
      },
    ],
    evidence: [
      {
        id: "building",
        label: localize("Building exterior", "Exterior del edificio"),
        description: localize("Wide shot", "Foto amplia"),
        icon: Building2,
        required: true,
        tips: localize("Capture the unit number and visible damage if safe.", "Captura el numero de unidad y dano visible si es seguro."),
      },
      {
        id: "rooms",
        label: localize("Fire room", "Cuarto del incendio"),
        description: localize("Origin point", "Punto de origen"),
        icon: Flame,
        required: true,
        tips: localize("Photograph where the fire appears to have started.", "Fotografia donde parece haber comenzado el fuego."),
      },
      {
        id: "smoke",
        label: localize("Smoke damage", "Dano por humo"),
        description: localize("Walls and ceilings", "Paredes y techos"),
        icon: CloudFog,
        required: true,
        tips: localize("Show soot lines and smoke staining clearly.", "Muestra claramente hollin y manchas de humo."),
      },
      {
        id: "water",
        label: localize("Water damage", "Dano por agua"),
        description: localize("From firefighting", "Por apagar el fuego"),
        icon: Waves,
        required: false,
        tips: localize("Capture soaked floors, furniture, and electronics.", "Captura pisos, muebles y electronicos mojados."),
      },
    ],
    dos: [
      {
        text: localize("Stay outside until cleared", "Quedate afuera hasta que te autoricen"),
        explanation: localize("Smoke and structure damage stay dangerous after flames are out.", "El humo y el dano estructural siguen siendo peligrosos aun sin llamas."),
        icon: ShieldAlert,
      },
      {
        text: localize("Ask about temporary housing coverage", "Pregunta por vivienda temporal"),
        explanation: localize("Hotel and food costs matter fast after a fire.", "Hotel y comida se vuelven gastos importantes rapido despues de un incendio."),
        icon: BedDouble,
      },
      {
        text: localize("Photograph soot and water too", "Fotografia hollin y agua tambien"),
        explanation: localize("Fire claims are not only about what burned.", "Los reclamos por incendio no son solo por lo que se quemo."),
        icon: Camera,
      },
    ],
    donts: [
      {
        text: localize("Don't re-enter early", "No vuelvas a entrar demasiado pronto"),
        explanation: localize("Toxic smoke and unstable structures can injure you.", "El humo toxico y la estructura inestable pueden lesionarte."),
        icon: Ban,
      },
      {
        text: localize("Don't wash soot before photos", "No limpies el hollin antes de tomar fotos"),
        explanation: localize("Cleaning first can erase proof of smoke damage.", "Limpiar primero puede borrar la prueba del dano por humo."),
        icon: PaintBucket,
      },
      {
        text: localize("Don't throw anything out immediately", "No tires nada de inmediato"),
        explanation: localize("The adjuster may need to inspect it.", "El ajustador puede necesitar inspeccionarlo."),
        icon: Trash2,
      },
    ],
    documents: [
      {
        id: "fire_report",
        label: localize("Fire incident report", "Reporte del incendio"),
        description: localize("From fire department", "De bomberos"),
        required: true,
        where_to_find: localize("Ask the responding department for the incident number and report process.", "Pregunta al departamento que respondio por el numero del incidente y el proceso del reporte."),
      },
      {
        id: "inventory",
        label: localize("Damage inventory", "Inventario de danos"),
        description: localize("Burned, smoke, and water items", "Quemado, humo y agua"),
        required: true,
        where_to_find: localize("Build it room by room using your photos.", "Hazlo cuarto por cuarto usando tus fotos."),
      },
      {
        id: "hotel_receipts",
        label: localize("Hotel receipts", "Recibos de hotel"),
        description: localize("Temporary housing costs", "Costos de vivienda temporal"),
        required: false,
        where_to_find: localize("Save every receipt from the first night onward.", "Guarda cada recibo desde la primera noche."),
      },
    ],
  },
  weather_damage: {
    incidentType: "weather_damage",
    urgencyLevel: "within_24h",
    urgencyMessage: localize(
      "File within 24 hours and document the damage before cleanup crews or repairs change the scene.",
      "Presenta dentro de 24 horas y documenta el dano antes de que la limpieza o reparacion cambie la escena.",
    ),
    estimatedTimeline: localize("Typical resolution: 1 to 4 weeks", "Resolucion tipica: 1 a 4 semanas"),
    stateFarmClaimUrl: stateFarmLinks.homeClaims,
    steps: [
      {
        id: "safe_area",
        order: 1,
        title: localize("Check for immediate hazards", "Revisa peligros inmediatos"),
        description: localize(
          "Look for broken glass, exposed wires, or roof leaks before stepping around.",
          "Busca vidrios rotos, cables expuestos o filtraciones antes de caminar.",
        ),
        icon: Zap,
        urgency: "now",
        timeframe: localize("Right now", "Ahora mismo"),
        details: [
          localize("Stay clear of downed power lines and call the utility company.", "Mantente lejos de cables caidos y llama a la compania electrica."),
          localize("If the roof is open or the ceiling is bulging, leave the room.", "Si el techo esta abierto o el plafon se abomba, sal del cuarto."),
        ],
      },
      {
        id: "prevent_more",
        order: 2,
        title: localize("Prevent more damage", "Evita mas dano"),
        description: localize(
          "Use towels, tarps, or buckets if you can do it safely.",
          "Usa toallas, lonas o cubetas si puedes hacerlo con seguridad.",
        ),
        icon: PaintBucket,
        urgency: "soon",
        timeframe: localize("Within 1 hour", "Dentro de 1 hora"),
        details: [
          localize("Move electronics and valuables away from leaks.", "Mueve electronicos y cosas valiosas lejos de la filtracion."),
          localize("Do temporary protection only. Do not start full repairs yet.", "Haz proteccion temporal solamente. No empieces reparaciones completas todavia."),
        ],
      },
      {
        id: "photos",
        order: 3,
        title: localize("Photograph storm damage", "Fotografia el dano de la tormenta"),
        description: localize(
          "Show the roof, windows, floors, and damaged belongings.",
          "Muestra techo, ventanas, pisos y pertenencias danadas.",
        ),
        icon: Camera,
        urgency: "soon",
        timeframe: localize("Before cleanup", "Antes de limpiar"),
        details: [
          localize("Take wide photos of the room and close-ups of the damage.", "Toma fotos amplias del cuarto y de cerca del dano."),
          localize("Photograph outdoor damage if it is safe to go outside.", "Fotografia danos afuera solo si es seguro salir."),
          localize("Include hail size, branches, or visible weather debris if present.", "Incluye granizo, ramas o restos de tormenta si los hay."),
        ],
      },
      {
        id: "weather_proof",
        order: 4,
        title: localize("Capture proof of the storm", "Guarda prueba de la tormenta"),
        description: localize(
          "Save screenshots of weather alerts, radar, or local warnings.",
          "Guarda capturas de alertas, radar o avisos locales.",
        ),
        icon: Smartphone,
        urgency: "soon",
        timeframe: localize("Same day", "Ese mismo dia"),
        details: [
          localize("Take screenshots of the severe weather alert on your phone.", "Toma capturas de la alerta severa en tu telefono."),
          localize("Note the date and time the storm passed.", "Anota la fecha y hora en que paso la tormenta."),
        ],
      },
      {
        id: "file_claim",
        order: 5,
        title: localize("File the claim", "Presenta el reclamo"),
        description: localize(
          "Share damage photos, temporary mitigation steps, and weather proof.",
          "Comparte fotos del dano, pasos temporales y prueba del clima.",
        ),
        icon: Phone,
        urgency: "soon",
        timeframe: localize("Within 24 hours", "Dentro de 24 horas"),
        details: [
          localize("Ask which emergency repairs are safe to do immediately.", "Pregunta cuales reparaciones de emergencia puedes hacer de inmediato."),
          localize("Keep receipts for tarps, fans, plywood, or cleanup help.", "Guarda recibos de lonas, ventiladores, madera o ayuda de limpieza."),
        ],
      },
    ],
    evidence: [
      {
        id: "roof",
        label: localize("Roof or ceiling", "Techo o plafon"),
        description: localize("Leak or opening", "Filtracion o abertura"),
        icon: House,
        required: true,
        tips: localize("Show the full damaged area and one close-up.", "Muestra toda el area danada y una foto de cerca."),
      },
      {
        id: "window",
        label: localize("Window or wall", "Ventana o pared"),
        description: localize("Broken or cracked", "Rota o cuarteada"),
        icon: Building2,
        required: true,
        tips: localize("Include any broken glass on the floor too.", "Incluye tambien cualquier vidrio roto en el piso."),
      },
      {
        id: "belongings",
        label: localize("Damaged belongings", "Pertenencias danadas"),
        description: localize("Furniture and electronics", "Muebles y electronicos"),
        icon: Sofa,
        required: true,
        tips: localize("Capture both the item and the storm damage around it.", "Captura tanto el objeto como el dano de la tormenta alrededor."),
      },
      {
        id: "weather_alert",
        label: localize("Weather alert", "Alerta del clima"),
        description: localize("Screenshot", "Captura de pantalla"),
        icon: CloudLightning,
        required: false,
        tips: localize("Save the alert with date and time if you received one.", "Guarda la alerta con fecha y hora si recibiste una."),
      },
    ],
    dos: [
      {
        text: localize("Stop further damage safely", "Deten mas dano si es seguro"),
        explanation: localize("Temporary protection is good. Full repairs can wait.", "La proteccion temporal ayuda. Las reparaciones completas pueden esperar."),
        icon: PaintBucket,
      },
      {
        text: localize("Document the storm proof", "Guarda prueba de la tormenta"),
        explanation: localize("Screenshots and dates help connect damage to the event.", "Capturas y fechas ayudan a vincular el dano con el evento."),
        icon: Smartphone,
      },
      {
        text: localize("Keep receipts for temporary fixes", "Guarda recibos de arreglos temporales"),
        explanation: localize("Emergency supplies may be reimbursable.", "Los suministros de emergencia pueden ser reembolsables."),
        icon: Receipt,
      },
    ],
    donts: [
      {
        text: localize("Don't start full repairs before documenting", "No empieces reparaciones completas antes de documentar"),
        explanation: localize("The insurer may need to see the original damage first.", "La aseguradora puede necesitar ver el dano original primero."),
        icon: Ban,
      },
      {
        text: localize("Don't go near downed power lines", "No te acerques a cables caidos"),
        explanation: localize("Treat every downed line as live.", "Trata cada cable caido como si tuviera corriente."),
        icon: Zap,
      },
      {
        text: localize("Don't throw out wet items immediately", "No tires objetos mojados de inmediato"),
        explanation: localize("Keep them until the adjuster says disposal is okay.", "Guardalos hasta que el ajustador diga que ya puedes desecharlos."),
        icon: Trash2,
      },
    ],
    documents: [
      {
        id: "storm_photos",
        label: localize("Storm damage photos", "Fotos del dano por tormenta"),
        description: localize("Roof, windows, belongings", "Techo, ventanas, pertenencias"),
        required: true,
        where_to_find: localize("Take them before cleanup or major repair.", "Tomalas antes de limpiar o reparar en grande."),
      },
      {
        id: "weather_alerts",
        label: localize("Weather alert screenshots", "Capturas de alertas del clima"),
        description: localize("Storm proof", "Prueba de la tormenta"),
        required: false,
        where_to_find: localize("Save alerts, radar screenshots, or local news posts.", "Guarda alertas, radar o publicaciones locales."),
      },
      {
        id: "repair_estimate",
        label: localize("Repair estimate", "Estimado de reparacion"),
        description: localize("Roof, window, drywall, etc.", "Techo, ventana, panel, etc."),
        required: false,
        where_to_find: localize("Get one estimate after the claim is opened unless they tell you otherwise.", "Consigue un estimado despues de abrir el reclamo salvo que te digan otra cosa."),
      },
    ],
  },
  medical_emergency: {
    incidentType: "medical_emergency",
    urgencyLevel: "immediate",
    urgencyMessage: localize(
      "Act now — get medical care first, then keep every record and bill tied to the emergency.",
      "Actua ahora: consigue atencion medica primero y luego guarda cada registro y factura ligada a la emergencia.",
    ),
    estimatedTimeline: localize("Typical resolution: 2 to 6 weeks", "Resolucion tipica: 2 a 6 semanas"),
    stateFarmClaimUrl: stateFarmLinks.fileClaim,
    steps: [
      {
        id: "care",
        order: 1,
        title: localize("Get urgent care", "Busca atencion urgente"),
        description: localize("Health comes first. Call 911 or go to the ER if needed.", "La salud va primero. Llama al 911 o ve a urgencias si hace falta."),
        icon: Hospital,
        urgency: "now",
        timeframe: localize("Right now", "Ahora mismo"),
        details: [
          localize("Keep discharge papers and treatment notes.", "Guarda papeles de salida y notas del tratamiento."),
          localize("Take a photo of prescriptions and billing paperwork.", "Toma fotos de recetas y papeles de cobro."),
        ],
      },
      {
        id: "records",
        order: 2,
        title: localize("Collect medical records", "Reune registros medicos"),
        description: localize("You will need them for reimbursement or follow-up.", "Los vas a necesitar para reembolso o seguimiento."),
        icon: FileText,
        urgency: "soon",
        timeframe: localize("Within 24 hours", "Dentro de 24 horas"),
        details: [
          localize("Ask for itemized bills when possible.", "Pide facturas detalladas cuando sea posible."),
          localize("Save ambulance, ER, follow-up, and medication receipts.", "Guarda recibos de ambulancia, urgencias, seguimiento y medicinas."),
        ],
      },
    ],
    evidence: [
      {
        id: "medical_docs",
        label: localize("Medical papers", "Papeles medicos"),
        description: localize("Bills and discharge notes", "Facturas y notas de salida"),
        icon: FileText,
        required: true,
        tips: localize("Photograph every page clearly before papers get lost.", "Fotografia cada pagina claramente antes de que se pierda."),
      },
    ],
    dos: [
      {
        text: localize("Get treatment first", "Atiendete primero"),
        explanation: localize("Insurance paperwork can wait until you are safe.", "El papeleo del seguro puede esperar hasta que estes a salvo."),
        icon: Hospital,
      },
    ],
    donts: [
      {
        text: localize("Don't throw away bills", "No tires las facturas"),
        explanation: localize("You may need them for reimbursement or records.", "Puede que las necesites para reembolso o registros."),
        icon: Ban,
      },
    ],
    documents: [
      {
        id: "medical_bills",
        label: localize("Medical bills", "Facturas medicas"),
        description: localize("ER, ambulance, medication", "Urgencias, ambulancia, medicina"),
        required: true,
        where_to_find: localize("Ask the hospital and pharmacy for itemized copies.", "Pide copias detalladas al hospital y farmacia."),
      },
    ],
  },
  other: {
    incidentType: "other",
    urgencyLevel: "within_week",
    urgencyMessage: localize(
      "Start documenting now. A calm, clear record makes every claim easier.",
      "Empieza a documentar ahora. Un registro claro y calmado facilita cualquier reclamo.",
    ),
    estimatedTimeline: localize("Typical resolution: 1 to 3 weeks", "Resolucion tipica: 1 a 3 semanas"),
    stateFarmClaimUrl: stateFarmLinks.fileClaim,
    steps: [
      {
        id: "stabilize",
        order: 1,
        title: localize("Stabilize the situation", "Estabiliza la situacion"),
        description: localize("Make sure the immediate problem stops getting worse.", "Asegurate de que el problema no siga empeorando."),
        icon: Navigation,
        urgency: "now",
        timeframe: localize("Right now", "Ahora mismo"),
        details: [
          localize("Protect people first, then protect property.", "Protege a las personas primero y luego la propiedad."),
          localize("Take quick notes about what happened and when.", "Haz notas rapidas sobre lo que paso y cuando."),
        ],
      },
      {
        id: "document",
        order: 2,
        title: localize("Document the damage", "Documenta el dano"),
        description: localize("Photos and receipts build your timeline.", "Fotos y recibos construyen tu linea de tiempo."),
        icon: Camera,
        urgency: "soon",
        timeframe: localize("Same day", "Ese mismo dia"),
        details: [
          localize("Take wide photos, close photos, and keep a short written summary.", "Toma fotos amplias, de cerca y guarda un resumen corto por escrito."),
          localize("Save any report numbers, emails, or repair notes.", "Guarda numeros de reporte, correos o notas de reparacion."),
        ],
      },
      {
        id: "claim",
        order: 3,
        title: localize("Open the claim", "Abre el reclamo"),
        description: localize("Call or file online once you can explain the loss clearly.", "Llama o presenta en linea cuando ya puedas explicar la perdida con claridad."),
        icon: Phone,
        urgency: "later",
        timeframe: localize("Within 24 hours", "Dentro de 24 horas"),
        details: [
          localize("Use simple, factual language.", "Usa lenguaje simple y factual."),
          localize("Ask what documents they want first.", "Pregunta que documentos quieren primero."),
        ],
      },
    ],
    evidence: [
      {
        id: "damage",
        label: localize("Damage photos", "Fotos del dano"),
        description: localize("Wide and close", "Amplias y de cerca"),
        icon: Camera,
        required: true,
        tips: localize("Take at least one wide shot and one close shot.", "Toma al menos una foto amplia y una de cerca."),
      },
    ],
    dos: [
      {
        text: localize("Write a short timeline", "Escribe una linea de tiempo corta"),
        explanation: localize("Facts collected early are easier to trust later.", "Los hechos reunidos temprano son mas confiables despues."),
        icon: NotebookPen,
      },
    ],
    donts: [
      {
        text: localize("Don't wait until details fade", "No esperes a que se te olviden los detalles"),
        explanation: localize("Memories get weaker quickly after a stressful event.", "Los recuerdos se vuelven mas debiles rapido despues de un evento estresante."),
        icon: Ban,
      },
    ],
    documents: [
      {
        id: "summary",
        label: localize("Written summary", "Resumen por escrito"),
        description: localize("What happened and when", "Que paso y cuando"),
        required: true,
        where_to_find: localize("Write it yourself while the details are fresh.", "Escribelo tu mismo mientras los detalles estan frescos."),
      },
    ],
  },
};

export function getIncidentCategories(language: Language): IncidentCategory[] {
  return INCIDENT_CATEGORIES.map((category) => ({
    ...category,
    label: pickText(language, category.label),
    sublabel: pickText(language, category.sublabel),
  }));
}

export function getInitialClaimProgressStore(): Record<IncidentType, ClaimProgressState> {
  return {
    car_accident: mapProgress(),
    apartment_flood: mapProgress(),
    theft: mapProgress(),
    fire: mapProgress(),
    weather_damage: mapProgress(),
    medical_emergency: mapProgress(),
    other: mapProgress(),
  };
}

export function getClaimGuide(
  incidentType: IncidentType,
  language: Language,
  progress?: Partial<ClaimProgressState>,
  personalization?: ClaimGuidePersonalization | null,
): ClaimGuide {
  const template = GUIDE_TEMPLATES[incidentType];
  const progressState = mapProgress(progress);

  const mapSteps = template.steps.map<ClaimStep>((step) => ({
    ...step,
    title: pickText(language, step.title),
    description: pickText(language, step.description),
    timeframe: pickText(language, step.timeframe),
    details: step.details.map((detail) => pickText(language, detail)),
    warning: step.warning ? pickText(language, step.warning) : undefined,
    completed: progressState.completedStepIds.includes(step.id),
  }));

  const mapEvidence = template.evidence.map<EvidenceItem>((item) => ({
    ...item,
    label: pickText(language, item.label),
    description: pickText(language, item.description),
    tips: pickText(language, item.tips),
    captured: progressState.capturedEvidenceIds.includes(item.id),
  }));

  const mapDos = template.dos.map<DoDontItem>((item) => ({
    ...item,
    text: pickText(language, item.text),
    explanation: pickText(language, item.explanation),
  }));

  const mapDonts = template.donts.map<DoDontItem>((item) => ({
    ...item,
    text: pickText(language, item.text),
    explanation: pickText(language, item.explanation),
  }));

  const mapDocuments = template.documents.map<DocumentItem>((item) => ({
    ...item,
    label: pickText(language, item.label),
    description: pickText(language, item.description),
    where_to_find: pickText(language, item.where_to_find),
    collected: progressState.collectedDocumentIds.includes(item.id),
  }));

  return {
    incidentType,
    urgencyLevel: personalization?.urgency ?? template.urgencyLevel,
    urgencyMessage: personalization?.urgencyMessage ?? pickText(language, template.urgencyMessage),
    steps: mapSteps,
    evidence: mapEvidence,
    dos: mapDos,
    donts: mapDonts,
    documents: mapDocuments,
    estimatedTimeline: personalization?.estimatedTimeline ?? pickText(language, template.estimatedTimeline),
    stateFarmPhone: stateFarmLinks.phone,
    stateFarmClaimUrl: template.stateFarmClaimUrl,
  };
}
