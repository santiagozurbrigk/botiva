import { useEffect, useCallback, useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import logo from './assets/logo.png';

const stats = [
  { label: 'Pedidos diarios automatizados', value: '+200' },
  { label: 'Errores reducidos', value: '-90%' },
  { label: 'Nuevas franquicias listas', value: 'En minutos' },
];

const features = [
  {
    title: 'Bot automático de WhatsApp',
    description:
      'Recibe y procesa pedidos 24/7 sin intervención manual. El bot entiende lenguaje natural, identifica productos, calcula totales y confirma automáticamente con el cliente.',
  },
  {
    title: 'Operación sincronizada',
    description:
      'Administradores, cocina, mozos y repartidores ven exactamente lo que deben hacer en cada momento. Todo se actualiza en tiempo real sin demoras.',
  },
  {
    title: 'Control financiero completo',
    description:
      'Dashboards con métricas en tiempo real: ventas diarias, semanales y mensuales. Análisis de productos más vendidos, horarios pico y rendimiento de cada equipo.',
  },
];

const moduleSummaries = [
  {
    title: 'Expansión para cadenas',
    points: [
      'Replica paneles de operación para cada nueva sucursal en minutos',
      'Centraliza indicadores sin exponer herramientas internas de Botiva',
    ],
  },
  {
    title: 'Panel de Administración',
    points: [
      'Gestiona menú, pedidos, mozos, repartidores y stock desde cualquier dispositivo',
      'Dashboard financiero con ventas, estadísticas y análisis de rendimiento en tiempo real',
    ],
  },
  {
    title: 'Panel de Cocina',
    points: [
      'Recibe comandas automáticamente con notificaciones de sonido',
      'Desliza comandas: izquierda (listo) o derecha (cancelar). Actualización en tiempo real',
    ],
  },
  {
    title: 'Panel para Mozos',
    points: [
      'Crea comandas digitales desde el panel móvil',
      'Ve solo sus mesas asignadas y comandas realizadas. Envío automático a cocina y administración',
    ],
  },
  {
    title: 'Panel para Repartidores',
    points: [
      'Panel móvil para ver pedidos asignados, actualizar estados y registrar cobros',
      'Información completa: dirección, teléfono del cliente, productos y monto a cobrar',
    ],
  },
  {
    title: 'Gestión de Stock',
    points: [
      'Cocina envía pedidos de stock necesarios al panel administrativo',
      'Visualización centralizada de todos los pedidos con fecha, horario, nombre y plaza',
    ],
  },
];

const benefits = [
  'Capacidad para atender más pedidos con el mismo equipo.',
  'Experiencia coherente de marca en cada sucursal.',
  'Onboarding inmediato de nuevos restaurantes.',
  'Información accionable para crecer sin improvisar.',
];

const stories = [
  {
    name: 'Dark Kitchen que duplicó pedidos',
    quote:
      '“Al salir de los pedidos manuales en WhatsApp, eliminamos errores y en pocas semanas vimos el doble de ventas.”',
  },
  {
    name: 'Cadena de hamburguesas en expansión',
    quote:
      '“Abrimos tres sucursales en dos meses porque Botiva nos dio procesos listos y enlaces configurados por restaurante.”',
  },
  {
    name: 'Emprendimiento familiar profesionalizado',
    quote:
      '“Ahora sabemos cada día cuánto vendimos, qué repartidor rindió mejor y qué producto es el favorito.”',
  },
];

const moduleDetails = [
  {
    id: 'expansion',
    title: 'Expansión multi-sucursal',
    description:
      'Cuando una cadena crece, Botiva entrega paneles replicables para cada restaurante, manteniendo procesos y enlaces consistentes por sucursal.',
    highlights: [
      'Duplicación guiada de paneles de operación para nuevas franquicias.',
      'Generación de enlaces operativos con restaurant_id listo para compartir.',
      'Visibilidad consolidada para los dueños de la cadena sin revelar herramientas internas.',
    ],
    accent: 'from-primary/10 to-white',
    variant: 'admin',
  },
  {
    id: 'admin',
    title: 'Panel de Administración',
    description:
      'Gestiona menú, pedidos, mozos, repartidores, stock y finanzas desde una sola vista pensada para la operación diaria.',
    highlights: [
      'Órdenes en vivo con filtros, asignación de repartidores y edición de pedidos.',
      'Control de stock: recibe pedidos desde cocina con fecha, horario, nombre y plaza.',
      'Dashboard financiero: ventas diarias/semanales/mensuales, productos más vendidos, horarios pico, rendimiento de mozos, repartidores y cocina.',
    ],
    accent: 'from-primary/15 via-white to-primary-light/10',
    variant: 'admin',
  },
  {
    id: 'kitchen',
    title: 'Panel de Cocina',
    description:
      'La cocina recibe comandas automáticamente con notificaciones de sonido. Sistema de deslizamiento intuitivo para marcar pedidos como listos o cancelados.',
    highlights: [
      'Actualización en tiempo real: comandas llegan automáticamente cuando se crean.',
      'Notificaciones de sonido para alertar sobre nuevas comandas.',
      'Sistema de deslizamiento: desliza izquierda (pedido listo) o derecha (cancelar).',
      'Información completa: nombre del mozo, mesa, horario, pedido y descripción.',
    ],
    accent: 'from-ink/5 via-white to-primary/5',
    variant: 'kitchen',
  },
  {
    id: 'waiters',
    title: 'Panel para Mozos',
    description:
      'Cada mozo tiene acceso independiente para crear comandas digitales, ver sus mesas asignadas y gestionar pedidos de consumo en local.',
    highlights: [
      'Creación de comandas digitales desde el panel móvil.',
      'Vista personalizada: solo ve las mesas asignadas y comandas realizadas.',
      'Envío automático: comandas se envían automáticamente a cocina y administración.',
      'Sincronización en tiempo real con el resto del sistema.',
    ],
    accent: 'from-primary/10 via-white to-accent/20',
    variant: 'rider',
  },
  {
    id: 'riders',
    title: 'Panel de Repartidores',
    description:
      'Cada repartidor ve solo sus pedidos asignados, actualiza estados de entrega y registra métodos de pago desde su panel móvil.',
    highlights: [
      'Panel móvil ligero para ver pedidos asignados y marcar estados.',
      'Información completa: dirección, teléfono del cliente, productos y monto a cobrar.',
      'Confirmación de cobros: registra efectivo, tarjeta o transferencia.',
      'Historial personal de entregas del día, semana o mes.',
    ],
    accent: 'from-primary/10 via-white to-accent/20',
    variant: 'rider',
  },
  {
    id: 'stock',
    title: 'Gestión de Stock',
    description:
      'Sistema centralizado donde la cocina envía pedidos de stock necesarios y el administrador visualiza todos los requerimientos en un solo lugar.',
    highlights: [
      'Pedidos desde cocina: cada plaza puede solicitar stock necesario con descripción.',
      'Visualización centralizada: todos los pedidos con fecha, horario, nombre y plaza.',
      'Control total: saber en todo momento qué está en falta y qué hay que pedir.',
      'Historial completo de solicitudes de stock.',
    ],
    accent: 'from-primary/10 to-white',
    variant: 'admin',
  },
];

const navSections = [
  { id: 'solucion', label: 'Solución' },
  { id: 'beneficios', label: 'Beneficios' },
  { id: 'historias', label: 'Historias' },
];

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = useCallback((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.classList.add('scroll-pulse');
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => el.classList.remove('scroll-pulse'), 1200);
    }
  }, []);

  const handleSectionClick = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      scrollToSection(sectionId);
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (location.state?.scrollTo) {
      scrollToSection(location.state.scrollTo);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, scrollToSection]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-tint via-white to-white text-ink">
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              navigate('/');
              setIsMenuOpen(false);
            }}
            className="group flex items-center gap-3 rounded-full border border-transparent px-2 py-1 transition hover:border-primary/40"
          >
            <img src={logo} alt="Botiva" className="h-10 w-auto rounded-xl bg-white/80 p-1 shadow-sm shadow-primary/20" />
            <p className="font-display text-2xl font-semibold tracking-tight text-primary group-hover:text-primary-dark">
              Botiva
            </p>
          </button>
        </div>

        <div className="hidden items-center gap-6 text-sm font-medium text-ink/70 md:flex">
          {navSections.map((item) => (
            <button key={item.id} onClick={() => handleSectionClick(item.id)} className="hover:text-primary">
              {item.label}
            </button>
          ))}
          <NavLink
            to="/modulos"
            className={({ isActive }) =>
              `hover:text-primary ${isActive ? 'text-primary font-semibold' : ''}`
            }
          >
            Módulos
          </NavLink>
        </div>

        <div className="hidden md:block">
          <button className="btn-primary text-sm">Agenda una demo</button>
        </div>

        <button
          className="md:hidden"
          aria-label="Abrir menú"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span className="sr-only">Abrir menú</span>
          <div className="flex flex-col gap-1.5">
            {[0, 1, 2].map((bar) => (
              <span
                key={bar}
                className={`h-0.5 w-7 rounded-full bg-ink transition ${
                  isMenuOpen ? 'translate-x-1 opacity-70' : ''
                }`}
              />
            ))}
          </div>
        </button>

        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden" onClick={() => setIsMenuOpen(false)} />
        )}

        <div
          className={`fixed right-4 top-20 z-50 w-[90%] max-w-xs rounded-3xl border border-primary/10 bg-white p-6 shadow-2xl transition-transform md:hidden ${
            isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0 pointer-events-none'
          }`}
        >
          <div className="space-y-4 text-base font-semibold text-ink">
            {navSections.map((item) => (
              <button
                key={item.id}
                className="flex w-full justify-between rounded-2xl border border-ink/5 px-4 py-3 text-left hover:border-primary/30 hover:text-primary"
                onClick={() => handleSectionClick(item.id)}
              >
                {item.label} <span className="text-primary">↗</span>
              </button>
            ))}
            <NavLink
              to="/modulos"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex w-full justify-between rounded-2xl border border-ink/5 px-4 py-3 hover:border-primary/30 hover:text-primary ${
                  isActive ? 'border-primary text-primary' : ''
                }`
              }
            >
              Módulos <span>↗</span>
            </NavLink>
            <button className="btn-primary w-full justify-center">Agenda una demo</button>
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="bg-ink py-10 text-center text-sm text-white/60">
        © {new Date().getFullYear()} Botiva. Operaciones inteligentes para restaurantes modernos.
      </footer>
    </div>
  );
};

const ModuleMockup = ({ variant }) => {
  const configs = {
    admin: {
      pills: 2,
      cards: 2,
      chart: false,
    },
    kitchen: {
      pills: 1,
      cards: 4,
      stacked: true,
    },
    rider: {
      pills: 3,
      list: true,
    },
  };

  const config = configs[variant] || configs.admin;

  return (
    <div className="rounded-[32px] border border-white/50 bg-gradient-to-br from-white via-white to-primary/5 p-6 shadow-xl shadow-primary/10">
      <div className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-primary/10 backdrop-blur">
        <div className="mb-5 flex gap-2">
          <span className="h-3 w-3 rounded-full bg-primary/70" />
          <span className="h-3 w-3 rounded-full bg-primary-light/70" />
          <span className="h-3 w-3 rounded-full bg-primary-dark/70" />
        </div>
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: config.pills }).map((_, idx) => (
              <span
                key={idx}
                className="rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold text-primary"
              >
                {variant === 'kitchen' ? 'Mesa 0' + (idx + 1) : 'Sucursal ' + (idx + 1)}
              </span>
            ))}
          </div>
          <div className={`grid gap-3 ${config.cards > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {Array.from({ length: config.cards || 3 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <div className="h-4 w-16 rounded-full bg-primary/20" />
                <div className="mt-4 h-8 rounded-2xl bg-white shadow-inner shadow-primary/10"></div>
                <div className="mt-3 h-2 rounded-full bg-primary/20" />
                <div className="mt-2 h-2 w-2/3 rounded-full bg-primary/10" />
              </div>
            ))}
          </div>
          {config.chart && (
            <div className="rounded-2xl border border-primary/10 p-4">
              <p className="text-sm font-semibold text-primary">Performance semanal</p>
              <div className="mt-3 flex items-end gap-2">
                {[40, 60, 35, 80, 50].map((height, idx) => (
                  <span
                    key={idx}
                    className="w-full rounded-full bg-gradient-to-t from-primary/10 to-primary"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
            </div>
          )}
          {config.list && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-primary/15 bg-white px-4 py-3 shadow-sm"
                >
      <div>
                    <p className="text-sm font-semibold text-ink">Pedido #{138 + item}</p>
                    <p className="text-xs text-ink/60">Entrega en 12 min</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">En viaje</span>
                </div>
              ))}
            </div>
          )}
          {config.stacked && (
            <div className="grid gap-3 md:grid-cols-2">
              {[1, 2].map((block) => (
                <div key={block} className="rounded-2xl border border-primary/10 bg-white/80 p-4 shadow-inner">
                  <p className="text-sm font-semibold text-primary">Pedido #{block + 42}</p>
                  <div className="mt-3 h-20 rounded-2xl bg-primary/5" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HomePage = () => (
  <main>
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-10 lg:grid-cols-2">
      <div className="space-y-6">
        <span className="tag-pill">Plataforma integral para restaurantes modernos</span>
        <h1 className="font-display text-5xl font-semibold leading-tight text-ink md:text-6xl">
          Automatiza pedidos, cocina, repartidores y finanzas en un solo lugar.
        </h1>
        <p className="text-lg text-ink/70">
          Botiva convierte cada sucursal en una franquicia profesional. Desde la primera interacción del cliente hasta el
          cierre del día, todo fluye sin fricción.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary">Quiero ver Botiva</button>
          <button className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-6 py-3 font-semibold text-ink transition hover:border-primary/40 hover:text-primary">
            Descargar dossier
        </button>
        </div>
        <div className="grid gap-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-glow md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-semibold text-primary">{stat.value}</p>
              <p className="text-sm text-ink/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="relative rounded-[32px] border border-primary/10 bg-white/70 p-8 shadow-xl shadow-primary/10">
        <div className="absolute inset-x-8 top-6 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-primary/60">
          <span>Botiva Flow</span>
          <span>24/7</span>
        </div>
        <div className="mt-10 space-y-4">
          {['Bot recibe pedido por WhatsApp', 'Bot procesa y confirma automáticamente', 'Pedido aparece en panel de administración', 'Mozo crea comanda o se asigna repartidor', 'Cocina recibe comanda con notificación', 'Cocina marca como listo deslizando', 'Repartidor entrega y registra cobro', 'Pedido completado en estadísticas'].map((step, index) => (
            <div
              key={step}
              className="flex items-center justify-between rounded-2xl border border-primary/10 bg-primary-tint/60 px-4 py-3"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">Paso {index + 1}</p>
                <p className="text-lg font-semibold text-ink">{step}</p>
              </div>
              <span className="text-xl text-primary">↗</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-ink/60">
          Cada pedido sigue este recorrido automáticamente desde WhatsApp hasta la entrega, sin intervención manual en la recepción.
        </p>
      </div>
    </section>

    <section id="solucion" className="scroll-mt-32 bg-white py-16">
      <div className="mx-auto max-w-6xl space-y-10 px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-ink/5 bg-ink/3 p-8 shadow-sm shadow-ink/5 backdrop-blur"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Botiva en acción</p>
              <h3 className="mt-3 font-display text-2xl text-ink">{feature.title}</h3>
              <p className="mt-3 text-ink/70">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="rounded-[32px] bg-gradient-to-br from-primary to-primary-dark px-8 py-10 text-white">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Problemas resueltos</p>
              <h2 className="mt-4 text-3xl font-semibold leading-snug">
                Desaparece los chats saturados, los pedidos perdidos y la falta de control operativo.
              </h2>
            </div>
            <ul className="space-y-3 text-base leading-relaxed text-white/80">
              <li>Pedidos que llegan por WhatsApp y se pierden: el bot los recibe automáticamente 24/7 y los organiza en un panel único.</li>
              <li>Mozos sin herramientas digitales: ahora crean comandas desde su panel y se envían automáticamente a cocina.</li>
              <li>Cocinas saturadas: reciben comandas automáticamente con notificaciones, sistema intuitivo de deslizamiento para marcar listos.</li>
              <li>Repartidores sin visibilidad: cada uno tiene su tablero con pedidos asignados y control de cobros.</li>
              <li>Stock descontrolado: cocina solicita lo necesario y administración ve todo centralizado.</li>
              <li>Dueños sin datos: dashboards financieros en tiempo real con rendimiento de mozos, repartidores y cocina.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-ink text-white">
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">Módulos clave</p>
            <h2 className="mt-3 font-display text-4xl font-semibold">Cada equipo con la herramienta perfecta</h2>
          </div>
          <Link className="btn-primary bg-white text-ink hover:bg-white/90" to="/modulos">
            Ver módulos en acción
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {moduleSummaries.map((module) => (
            <div key={module.title} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <h3 className="font-display text-2xl font-semibold">{module.title}</h3>
              <ul className="mt-4 space-y-3 text-white/80">
                {module.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="text-primary">●</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section id="beneficios" className="scroll-mt-32 bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="tag-pill bg-primary-tint text-primary">Resultados medibles</p>
            <h2 className="mt-4 font-display text-4xl font-semibold text-ink">Beneficios tangibles desde el día uno.</h2>
            <p className="mt-4 text-lg text-ink/70">
              Botiva sincroniza todo el negocio: bot automático de WhatsApp, paneles para administración, cocina, mozos y repartidores. 
              Reduciendo tiempos operativos, eliminando errores y haciendo visible cada peso con dashboards financieros en tiempo real.
            </p>
          </div>
          <ul className="space-y-4 rounded-3xl border border-ink/5 bg-ink/2 p-6 text-lg text-ink/80">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-4">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  ✓
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    {/* <section id="historias" className="scroll-mt-32 bg-primary-tint/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Historias reales</p>
          <h2 className="mt-3 font-display text-4xl text-ink">Lo que dicen quienes ya operan con Botiva</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {stories.map((story) => (
            <div key={story.name} className="rounded-3xl border border-primary/20 bg-white p-6 shadow-sm">
              <p className="text-lg font-semibold text-ink">{story.name}</p>
              <p className="mt-4 text-ink/70">{story.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section> */}

    <section className="bg-gradient-to-r from-ink to-primary-dark py-20 text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
        <p className="tag-pill border-white/30 bg-white/10 text-white">Listo para tu cadena</p>
        <h2 className="font-display text-4xl font-semibold leading-snug">
          Crea tu próxima sucursal en menos de 1 hora, con procesos replicables y enlaces configurados por restaurante.
        </h2>
        <p className="text-lg text-white/80">
          Botiva es el socio invisible que transforma el caos operativo en resultados medibles.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn-primary bg-white text-ink hover:bg-white/90">Agenda una demo</button>
          <button className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:border-white hover:bg-white/10">
            Hablar con un especialista
          </button>
        </div>
      </div>
    </section>
  </main>
);

const ModulesPage = () => (
  <main className="bg-white">
    <section className="mx-auto max-w-5xl px-6 py-16 text-center">
      <p className="tag-pill bg-primary-tint text-primary">Explora cada módulo</p>
      <h1 className="mt-5 font-display text-5xl font-semibold text-ink">La plataforma completa, en imágenes reales.</h1>
      <p className="mt-4 text-lg text-ink/70">
        Recorre cada panel del ecosistema Botiva y descubre cómo se ve la operación en vivo: bot automático de WhatsApp, 
        administradores, cocina, mozos, repartidores y equipos de expansión de cadenas.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to="/" className="btn-primary">
          Volver al sitio principal
        </Link>
        <button className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-6 py-3 font-semibold text-ink transition hover:border-primary/40 hover:text-primary">
          Agendar recorrido guiado
        </button>
      </div>
    </section>

    <section className="mx-auto max-w-6xl space-y-10 px-6 pb-20">
      {moduleDetails.map((module, index) => (
        <article
          key={module.id}
          id={module.id}
          className={`scroll-mt-24 grid gap-10 rounded-[32px] border border-ink/5 bg-gradient-to-br ${module.accent} p-8 shadow-lg lg:grid-cols-2`}
        >
          <div className={`${index % 2 !== 0 ? 'lg:order-2' : ''} space-y-4`}>
            <p className="tag-pill bg-white/70 text-primary">Módulo {index + 1}</p>
            <h2 className="font-display text-3xl text-ink">{module.title}</h2>
            <p className="text-lg text-ink/70">{module.description}</p>
            <ul className="space-y-3 text-ink/80">
              {module.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3">
                  <span className="text-primary">▹</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 pt-4">
              <button className="btn-primary text-sm">Ver demo en vivo</button>
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Ver resumen ↗
              </Link>
            </div>
          </div>
          <div className={`${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
            <ModuleMockup variant={module.variant} />
          </div>
        </article>
      ))}
    </section>
  </main>
);

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="modulos" element={<ModulesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
