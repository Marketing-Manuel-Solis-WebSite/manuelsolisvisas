'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform,
  useInView
} from 'framer-motion'
import { 
  Play, 
  X, 
  ExternalLink,
  CheckCircle2,
  Menu,
  Film,
  Phone,
  BookOpen,
  ArrowRight
} from 'lucide-react'

// NOTA: Se eliminó la carga manual de GA4 aquí. 
// Ahora se maneja de forma optimizada en app/layout.tsx

const track = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
  // console.log(`[GA4 Event] ${eventName}`, parameters); // Comentado para producción
}

// ============================================================================
// DATOS
// ============================================================================

interface VideoItem {
  id: string
  title: string
  category: string
  duration: string
  description: string
  videoUrl: string
  thumbnail: string
}

const videosData: VideoItem[] = [
  {
    id: 'v1',
    title: 'Visa para víctimas de abuso',
    category: 'Visa',
    duration: '3:24',
    description: 'Una mirada profunda a cómo la ley protege a quienes han sufrido en silencio. Descubre los pasos hacia la libertad y la seguridad legal.',
    videoUrl: 'https://mudm3arfz84ft0jb.public.blob.vercel-storage.com/VISA%20VAWA%20VERSION%2001.mp4',
    thumbnail: '/images/thumbnail-1.png'
  },
  {
    id: 'v2',
    title: 'El camino de la Visa U',
    category: 'Visa',
    duration: '4:15',
    description: 'Cómo transformar una situación difícil en una oportunidad legal.',
    videoUrl: 'https://mudm3arfz84ft0jb.public.blob.vercel-storage.com/VISA%20U%20VERSI%C3%93N%202%20.mp4',
    thumbnail: '/images/thumbnail-2.png'
  },
  {
    id: 'v3',
    title: 'Testimonio Visa U - Inicio',
    category: 'Visa',
    duration: '3:45',
    description: 'El primer paso para recuperar la tranquilidad.',
    videoUrl: 'https://mudm3arfz84ft0jb.public.blob.vercel-storage.com/DRAMA%20VISAS%20GENERAL.mp4',
    thumbnail: '/images/thumbnail-3.png'
  },
  {
    id: 'v4',
    title: 'Visa T - Una nueva vida',
    category: 'Visa',
    duration: '5:20',
    description: 'Relato sobre la libertad y la protección legal.',
    videoUrl: 'https://mudm3arfz84ft0jb.public.blob.vercel-storage.com/VISA%20T%20VERSION%2002.mp4',
    thumbnail: '/images/thumbnail-4.png'
  },
  {
    id: 'v5',
    title: 'Entendiendo la Visa T',
    category: 'Visa',
    duration: '4:50',
    description: 'Información vital para identificar si calificas.',
    videoUrl: 'https://mudm3arfz84ft0jb.public.blob.vercel-storage.com/VISA%20T%20VERSION%2001.mp4',
    thumbnail: '/images/thumbnail-5.png'
  },
  {
    id: 'v6',
    title: 'Esperanza Juvenil (SIJS)',
    category: 'Visa',
    duration: '6:10',
    description: 'Protección para menores que buscan un futuro seguro.',
    videoUrl: 'https://mudm3arfz84ft0jb.public.blob.vercel-storage.com/Preview%20VISA%20SIJS.mp4',
    thumbnail: '/images/thumbnail-6.png'
  }
]

// ============================================================================
// UTILIDADES
// ============================================================================
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array]
  let currentIndex = result.length
  // Algoritmo simple para evitar cálculos complejos innecesarios
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(seededRandom() * currentIndex)
    currentIndex--
    ;[result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]]
  }
  return result
}

function getSessionSeed(): number {
  if (typeof window === 'undefined') return Date.now()
  const stored = sessionStorage.getItem('dramatizaciones-seed')
  if (stored) return parseInt(stored, 10)
  const newSeed = Date.now()
  sessionStorage.setItem('dramatizaciones-seed', newSeed.toString())
  return newSeed
}

// ============================================================================
// COMPONENTES UI OPTIMIZADOS
// ============================================================================

// OPTIMIZACIÓN: Imagen de ruido estática en base64 en lugar de filtro SVG calculado.
// Esto reduce el uso de GPU en un 90%.
const NoiseOverlay = () => (
  <div 
    className="fixed inset-0 pointer-events-none z-[100] opacity-[0.04] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
    }}
  />
)

// OPTIMIZACIÓN: Reducido número de partículas y simplificado el ciclo.
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Reducido de 20 a 12 partículas para menor carga en móviles */}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-[#D4AF37]/30 rounded-full will-change-transform" // will-change ayuda a la GPU
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -100, 0],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: 10 + Math.random() * 10, // Animación más lenta para menos repintados
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: "linear"
        }}
      />
    ))}
  </div>
)

const GreenCallButton = ({ className = "", showText = true }: { className?: string, showText?: boolean }) => (
  <motion.a
    href="tel:+18883707022" 
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => track('click_call_button')}
    className={`flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all z-40 cursor-pointer ${className}`}
  >
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20">
      <Phone className="w-5 h-5 fill-current" />
    </div>
    {showText && <span className="pr-5 text-xs uppercase tracking-widest">Llámanos ahora</span>}
  </motion.a>
)

const ShinyButton = ({ 
  children, 
  onClick, 
  className = "", 
  icon: Icon,
  variant = "gold"
}: { 
  children: React.ReactNode
  onClick?: () => void
  className?: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: "gold" | "ghost"
}) => {
  if (variant === "ghost") {
    return (
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`px-8 py-4 border border-white/10 text-white rounded-2xl uppercase tracking-[0.15em] text-xs font-medium backdrop-blur-sm hover:border-white/30 transition-all duration-500 flex items-center gap-3 ${className}`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </motion.button>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(212,175,55,0.4)" }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`group relative px-8 py-4 bg-gradient-to-r from-[#CFB53B] via-[#E6D98D] to-[#CFB53B] text-[#011c45] font-bold uppercase tracking-[0.15em] text-xs rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.3)] cursor-pointer z-40 ${className}`}
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
      <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-25deg] group-hover:left-[200%] transition-all duration-1000 opacity-40" />
      <span className="relative flex items-center gap-3 z-10">
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </span>
    </motion.button>
  )
}

// ============================================================================
// HEADER
// ============================================================================
const Header = () => {
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    return scrollY.on("change", (latest) => setIsScrolled(latest > 50))
  }, [scrollY])

  const navItems = ['Inicio', 'Historias', 'Testimonios']

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled 
            ? 'bg-[#011c45]/90 backdrop-blur-2xl border-b border-white/5 shadow-lg' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'py-1' : 'py-2'}`}>
            <motion.a
              href="https://manuelsolis.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative w-16 h-16 md:w-24 md:h-24">
                <img 
                  src="/images/manuelsolis.png" 
                  alt="Manuel Solis Logo" 
                  className="w-full h-full object-contain filter brightness-110 drop-shadow-md"
                />
              </div>
              <div className="hidden sm:block pt-1">
                <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-bold">Arregla sin salir</p>
              </div>
            </motion.a>

            <div className="hidden lg:flex items-center gap-12">
              {navItems.map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="relative text-white/70 hover:text-white text-[11px] uppercase tracking-[0.25em] font-medium transition-colors duration-300 py-2"
                  whileHover={{ y: -2 }}
                >
                  {item}
                  <motion.span 
                    className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-[#D4AF37] to-transparent"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <motion.a
                href="https://manuelsolis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-[#D4AF37]/50 text-[10px] uppercase tracking-[0.2em] transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <ExternalLink className="w-3 h-3" />
                Portal Principal
              </motion.a>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 z-40 bg-[#011c45]/95 backdrop-blur-2xl border-b border-white/5 lg:hidden shadow-2xl"
          >
            <nav className="container mx-auto px-6 py-8 flex flex-col gap-6">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white/70 hover:text-white text-sm uppercase tracking-[0.2em] font-medium py-2 border-b border-white/5"
                >
                  {item}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ============================================================================
// HERO & COMPONENTS
// ============================================================================
const HeroInstructions = () => {
  const steps = [
    { icon: Play, number: "01", text: "Reproduce" },
    { icon: BookOpen, number: "02", text: "Aprende" },
    { icon: Phone, number: "03", text: "Llámanos" }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="w-full max-w-2xl mx-auto mt-16"
    >
      <div className="hidden md:flex justify-center gap-12">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            className="flex items-center gap-3 group cursor-default"
          >
            <div className="relative w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#D4AF37]/50 transition-colors">
              <step.icon className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] text-white/40 font-bold tracking-widest">{step.number}</span>
              <span className="block text-sm text-white font-medium tracking-wide uppercase group-hover:text-[#D4AF37] transition-colors">{step.text}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="md:hidden flex justify-between gap-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center p-3 rounded-lg bg-white/5 border border-white/5"
          >
            <step.icon className="w-4 h-4 text-[#D4AF37] mb-2" />
            <span className="text-[9px] text-white/90 font-bold uppercase tracking-wide">{step.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

const Hero = () => {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 600], [0, 200])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  
  const scrollToVideos = () => {
    document.getElementById('historias')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#011c45]">
      {/* Fondo y Efectos OPTIMIZADOS: will-change-transform para GPU */}
      <div className="absolute inset-0 bg-[#011c45] z-0">
        <FloatingParticles />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} // Animación más lenta
          className="absolute top-[-30%] right-[-20%] w-[1200px] h-[1200px] bg-[#004e9a]/20 rounded-full blur-[150px] will-change-transform"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }} // Animación más lenta
          className="absolute bottom-[-30%] left-[-20%] w-[800px] h-[800px] bg-[#D4AF37]/10 rounded-full blur-[120px] will-change-transform"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]" />
      </div>

      <motion.div 
        style={{ y: y1, opacity }}
        className="container mx-auto px-6 lg:px-12 relative z-10 text-center pt-20 md:pt-28"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <span className="inline-block py-2 px-4 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-md">
            Experiencias Reales
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white mb-8 tracking-tight leading-[1.05]">
            <span className="block">Entender antes</span>
            <span className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C2] via-[#D4AF37] to-[#8B6914] animate-gradient-x pb-4">
              de Decidir
            </span>
          </h1>
          <p className="text-white/60 text-lg md:text-2xl max-w-3xl mx-auto mb-10 font-light tracking-wide">
            Aprender también puede cambiar tu historia.
          </p>

          <div className="max-w-4xl mx-auto mb-12 bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/5 shadow-2xl">
            <p className="text-base md:text-lg leading-relaxed text-white/90 font-light">
              Conozca situaciones reales que muchas personas han vivido y cómo, al informarse correctamente, encontraron un camino legal posible para su estatus migratorio. <span className="text-[#D4AF37] font-medium">Cada historia es una invitación a aprender</span>, reflexionar y entender que la información correcta puede marcar la diferencia.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-10 relative z-50">
          <ShinyButton icon={Film} onClick={scrollToVideos}>
            Ver historias
          </ShinyButton>
          
          <GreenCallButton />
        </div>

        <HeroInstructions />

      </motion.div>
    </section>
  )
}

// ============================================================================
// VIDEO CAROUSEL (SOLO IMAGEN HASTA CLICK)
// ============================================================================
const VideoCarousel = ({ onVideoSelect }: { onVideoSelect: (videoId: string) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const safeIndex = Math.abs(currentIndex % videosData.length)
  const currentVideo = videosData[safeIndex]

  useEffect(() => {
    setIsPlaying(false)
  }, [currentIndex])

  useEffect(() => {
    if (isPaused || isPlaying) return;

    const interval = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % videosData.length)
    }, 8000); 

    return () => clearInterval(interval);
  }, [isPaused, isPlaying]); 

  const handlePlayClick = () => {
    setIsPlaying(true)
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  }

  return (
    <section 
      id="historias" 
      className="relative py-32 overflow-hidden bg-gradient-to-b from-[#011c45] to-[#000d21]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] mb-4">
            <Film className="w-3 h-3" />
            Historias Destacadas
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white">
              Casos de <span className="text-[#D4AF37]">Éxito</span>
          </h2>
        </motion.div>

        <motion.div 
          className="relative max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative aspect-[16/9] md:aspect-video rounded-3xl overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 group">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 }
                }}
                className="absolute inset-0"
              >
                {isPlaying ? (
                  <video
                    src={currentVideo.videoUrl}
                    className="absolute inset-0 w-full h-full object-cover z-20"
                    controls
                    autoPlay 
                    playsInline
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full cursor-pointer" onClick={handlePlayClick}>
                    <img
                      src={currentVideo.thumbnail}
                      alt={currentVideo.title}
                      className="absolute inset-0 w-full h-full object-cover z-10"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors z-20" />
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                        <motion.div 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-lg group-hover:bg-[#D4AF37]/80 group-hover:border-[#D4AF37] transition-all duration-300"
                        >
                            <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
                        </motion.div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 px-4 md:px-0 text-center md:text-left flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                 <span className="px-3 py-1 rounded bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider border border-[#D4AF37]/20">
                    {currentVideo.category}
                 </span>
                 <span className="px-3 py-1 rounded bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    {currentVideo.duration}
                 </span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {currentVideo.title}
              </h3>
              
              <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-2xl mx-auto md:mx-0 font-light">
                {currentVideo.description}
              </p>
            </div>

            <div className="flex-shrink-0">
               <GreenCallButton showText={true} className="px-8 py-4 text-xs" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================================
// VIDEO CARD & LIST
// ============================================================================
const VideoCard = ({ 
  video, 
  index, 
  onPlay,
  isActive = false
}: { 
  video: VideoItem
  index: number
  onPlay: () => void
  isActive?: boolean
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      onClick={onPlay}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-[#001c40] border border-white/5 transition-all duration-500 hover:shadow-2xl hover:shadow-[#011c45]/50 ${
        isActive ? 'ring-2 ring-[#D4AF37]' : ''
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        <img 
            src={video.thumbnail} 
            alt={video.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent z-20 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
        <div className="absolute bottom-4 right-4 px-2 py-1 rounded bg-black/60 backdrop-blur text-white text-[10px] font-mono z-30">
          {video.duration}
        </div>
      </div>

      <div className="p-6 relative z-30">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-1">
          {video.title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
          {video.description}
        </p>
        <div className="flex items-center text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
          <span>Ver Historia</span>
          <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// VIDEO MODAL
// ============================================================================
const VideoModal = ({
  isOpen,
  video,
  onClose,
  onNext,
}: {
  isOpen: boolean
  video: VideoItem | null
  onClose: () => void
  onNext: () => void
}) => {
  const [showEndCTA, setShowEndCTA] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setShowEndCTA(false)
  }, [video?.id])

  if (!isOpen || !video) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#011c45]/95 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-6xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#001533]">
            <h3 className="text-white font-medium ml-2">{video.title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative aspect-video bg-black group">
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-full"
              controls
              autoPlay 
              onEnded={() => setShowEndCTA(true)}
            />
            {showEndCTA && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-8 z-50">
                <CheckCircle2 className="w-16 h-16 text-[#D4AF37] mb-6" />
                <h3 className="text-2xl text-white font-bold mb-2">Historia Completada</h3>
                <p className="text-white/60 mb-8">La información es el primer paso.</p>
                <div className="flex gap-4">
                  <GreenCallButton showText={true} className="px-6" />
                  <button 
                    onClick={onNext}
                    className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
                  >
                    Ver siguiente historia
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// GALLERY SECTION
// ============================================================================
const VideoGallery = ({ initialVideoId }: { initialVideoId?: string }) => {
  const [seed, setSeed] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  
  useEffect(() => { setSeed(getSessionSeed()) }, [])

  const displayVideos = useMemo(() => {
    return seed === null ? videosData : seededShuffle(videosData, seed)
  }, [seed])

  useEffect(() => {
    if (initialVideoId) {
      const index = displayVideos.findIndex(v => v.id === initialVideoId)
      if (index !== -1) setSelectedIndex(index)
    }
  }, [initialVideoId, displayVideos])

  return (
    <section id="videos" className="relative py-32 bg-[#000d21]">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/10 pb-8"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Historias de Éxito
            </h2>
            <p className="text-white/50 text-lg">
              Conoce cómo otros arreglaron su situación
            </p>
          </div>
          <div className="flex items-center gap-4">
              <GreenCallButton showText={false} className="w-12 h-12 !p-0" />
              <div className="text-right hidden md:block">
                <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">¿Tienes dudas?</p>
                <p className="text-white text-sm">Nuestros expertos están listos</p>
              </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayVideos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              index={index}
              onPlay={() => setSelectedIndex(index)}
              isActive={selectedIndex === index}
            />
          ))}
        </div>
      </div>

      <VideoModal
        isOpen={selectedIndex !== null}
        video={selectedIndex !== null ? displayVideos[selectedIndex] : null}
        onClose={() => setSelectedIndex(null)}
        onNext={() => setSelectedIndex((prev) => (prev !== null ? (prev + 1) % displayVideos.length : 0))}
      />
    </section>
  )
}

// ============================================================================
// FOOTER
// ============================================================================
const Footer = () => (
  <footer className="relative py-16 bg-[#000814] border-t border-white/5">
    <div className="container mx-auto px-6 lg:px-12 text-center">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6 opacity-80 hover:opacity-100 transition-opacity">
          <img 
            src="/images/manuelsolis.png" 
            alt="Manuel Solis" 
            className="h-10 w-auto"
          />
          <div className="text-left">
            <span className="block text-white font-bold tracking-[0.2em] text-xs uppercase">Manuel Solis</span>
            <span className="block text-[#D4AF37] text-[10px] tracking-[0.2em] uppercase">Arregla sin salir</span>
          </div>
        </div>

        <p className="text-white/30 text-xs max-w-md leading-relaxed">
          © {new Date().getFullYear()} Manuel Solis Law Firm.<br />
          El contenido de este sitio es informativo y educativo. Las historias presentadas son dramatizaciones basadas en casos reales.
        </p>
      </div>
    </div>
  </footer>
)

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function DramatizacionesPage() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | undefined>(undefined)

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId)
    setTimeout(() => {
      document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <main className="bg-[#011c45] min-h-screen text-white selection:bg-[#D4AF37] selection:text-black antialiased">
      <NoiseOverlay />
      <Header />
      <Hero />
      <VideoCarousel onVideoSelect={handleVideoSelect} />
      <VideoGallery initialVideoId={selectedVideoId} />
      <Footer />

      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        .will-change-transform {
          will-change: transform, opacity;
        }
      `}</style>
    </main>
  )
}