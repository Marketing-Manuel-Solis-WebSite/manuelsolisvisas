'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useMotionValue, 
  useMotionTemplate,
  useInView
} from 'framer-motion'
import { 
  Play, 
  X, 
  ChevronRight, 
  ChevronLeft,
  ExternalLink,
  Shuffle,
  CheckCircle2,
  Menu,
  Film,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react'
// Importamos la función track de Vercel Analytics
import { track } from '@vercel/analytics/react'

// ============================================================================
// CONFIGURACIÓN & DATOS
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
    title: 'Preview VAWA',
    category: 'Visa',
    duration: '3:24',
    description: 'Guía completa sobre el proceso de solicitud VAWA y requisitos legales necesarios.',
    videoUrl: 'https://mudm3arfz84ft0jb.public.blob.vercel-storage.com/Preview%20VAWA.mp4',
    thumbnail: '/images/thumbnail-1.jpg'
  },
  {
    id: 'v2',
    title: 'Preview Visa U - Parte 2',
    category: 'Visa',
    duration: '4:15',
    description: 'Segunda parte del proceso de visa U, requisitos y documentación requerida.',
    videoUrl: 'https://mudm3arfz84ft0jb.public.blob.vercel-storage.com/PREVIEW%20VISA%20U2.mp4',
    thumbnail: '/images/thumbnail-2.jpg'
  },
  {
    id: 'v3',
    title: 'Preview Visa U - Parte 1',
    category: 'Visa',
    duration: '3:45',
    description: 'Primera parte del proceso de visa U para víctimas de crímenes.',
    videoUrl: 'https://mudm3arfz84ft0jb.public.blob.vercel-storage.com/PREVIEW%20VISA%20U1.mp4',
    thumbnail: '/images/thumbnail-3.jpg'
  },
  {
    id: 'v4',
    title: 'Visa T - Versión 2',
    category: 'Visa',
    duration: '5:20',
    description: 'Versión actualizada del proceso de visa T para víctimas de tráfico humano.',
    videoUrl: 'https://mudm3arfz84ft0jb.public.blob.vercel-storage.com/VISA%20T%20VERSION%202.mp4',
    thumbnail: '/images/thumbnail-4.jpg'
  },
  {
    id: 'v5',
    title: 'Visa T - Versión 1',
    category: 'Visa',
    duration: '4:50',
    description: 'Primera versión del proceso de visa T y requisitos legales.',
    videoUrl: 'https://mudm3arfz84ft0jb.public.blob.vercel-storage.com/VISA%20T%20VERSION%2001.mp4',
    thumbnail: '/images/thumbnail-5.jpg'
  },
  {
    id: 'v6',
    title: 'Preview Visa SIJS',
    category: 'Visa',
    duration: '6:10',
    description: 'Guía completa sobre el Estatus Especial de Inmigrante Juvenil (SIJS).',
    videoUrl: 'https://mudm3arfz84ft0jb.public.blob.vercel-storage.com/Preview%20VISA%20SIJS.mp4',
    thumbnail: '/images/thumbnail-6.jpg'
  }
]

// ============================================================================
// UTILIDADES
// ============================================================================
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array]
  let currentIndex = result.length
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
// COMPONENTES UI
// ============================================================================

const NoiseOverlay = () => (
  <div 
    className="fixed inset-0 pointer-events-none z-[100] opacity-[0.025] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />
)

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-[#D4AF37]/30 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -100, 0],
          opacity: [0, 1, 0],
          scale: [0, 1.5, 0],
        }}
        transition={{
          duration: 4 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 4,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
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
      className={`group relative px-10 py-5 bg-gradient-to-r from-[#CFB53B] via-[#E6D98D] to-[#CFB53B] text-[#0B1120] font-bold uppercase tracking-[0.15em] text-xs rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.3)] ${className}`}
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

  const navItems = ['Inicio', 'Videos']

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled 
            ? 'bg-[#0B1120]/70 backdrop-blur-2xl border-b border-white/5' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'py-4' : 'py-6'}`}>
            <motion.a
              href="https://manuelsolis.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative w-12 h-12">
                <img 
                  src="/images/manuelsolis.png" 
                  alt="Manuel Solis Logo" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute -inset-1 bg-[#D4AF37]/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white text-sm font-bold tracking-[0.2em] uppercase">Manuel Solis</h1>
                <p className="text-[#D4AF37]/80 text-[10px] uppercase tracking-[0.3em]">Training Center • SLP</p>
              </div>
            </motion.a>

            <div className="hidden lg:flex items-center gap-12">
              {navItems.map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="relative text-white/50 hover:text-white text-[11px] uppercase tracking-[0.25em] font-medium transition-colors duration-300 py-2"
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
            className="fixed top-20 left-0 right-0 z-40 bg-[#0B1120]/95 backdrop-blur-2xl border-b border-white/5 lg:hidden"
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
    { icon: Target, number: "01", text: "Elige cualquier video" },
    { icon: Play, number: "02", text: "Observa y aprende" },
    { icon: Zap, number: "03", text: "Aplica al instante" }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 1 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 + i * 0.15 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative"
          >
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-[#D4AF37]/30 transition-all duration-500">
              <div className="absolute top-4 right-4 text-6xl font-black text-white/[0.03] leading-none">
                {step.number}
              </div>
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:from-[#D4AF37]/40 group-hover:to-[#D4AF37]/20 transition-all duration-500">
                <step.icon className="w-7 h-7 text-[#D4AF37]" />
                <div className="absolute inset-0 rounded-xl bg-[#D4AF37]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <h3 className="text-white text-lg font-bold relative z-10 group-hover:text-[#D4AF37] transition-colors duration-300">
                {step.text}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="md:hidden flex flex-col gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + i * 0.1 }}
            className="relative p-6 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl font-black text-[#D4AF37]/30">
                {step.number}
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <step.icon className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-white text-base font-bold flex-1">{step.text}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

const Hero = () => {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 600], [0, 200])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const scale = useTransform(scrollY, [0, 400], [1, 0.95])

  const scrollToVideos = () => {
    document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#0B1120]">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-30%] right-[-20%] w-[1000px] h-[1000px] bg-blue-600/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-30%] left-[-20%] w-[800px] h-[800px] bg-[#D4AF37]/10 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
        <FloatingParticles />
      </div>

      <motion.div 
        style={{ y: y1, opacity, scale }}
        className="container mx-auto px-6 lg:px-12 relative z-10 text-center pt-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-12 tracking-tight leading-[0.9]">
            <span className="block">Excelencia en</span>
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C2] via-[#D4AF37] to-[#8B6914] animate-gradient-x">
              Cada Llamada
            </span>
          </h1>
        </motion.div>

        <HeroInstructions />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex items-center justify-center mt-12"
        >
          <ShinyButton icon={Film} onClick={scrollToVideos}>
            Ver Catálogo de Videos
          </ShinyButton>
        </motion.div>
      </motion.div>
    </section>
  )
}

const VideoCarousel = ({ onVideoSelect }: { onVideoSelect: (videoId: string) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videosData.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const handlePrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + videosData.length) % videosData.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % videosData.length)
  }

  const handleVideoClick = (videoId: string) => {
    onVideoSelect(videoId)
  }

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120] via-[#0a0f1a] to-[#0B1120]" />
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] mb-6">
            <Film className="w-3 h-3" />
            Videos Destacados
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Explora <span className="text-[#D4AF37]">Nuestro Contenido</span>
          </h2>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-[#111827]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 cursor-pointer"
                onClick={() => handleVideoClick(videosData[currentIndex].id)}
              >
                <video
                  src={videosData[currentIndex].videoUrl}
                  className="w-full h-full object-cover"
                  poster={videosData[currentIndex].thumbnail}
                  muted
                  loop
                  autoPlay
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="inline-block px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#D4AF37]/20 text-[#D4AF37] backdrop-blur-xl border border-[#D4AF37]/20 mb-4">
                    {videosData[currentIndex].category}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {videosData[currentIndex].title}
                  </h3>
                  <p className="text-white/60 text-sm md:text-base max-w-2xl">
                    {videosData[currentIndex].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <div className="flex items-center gap-2">
              {videosData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx)
                    setIsAutoPlaying(false)
                  }}
                  className={`transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-8 h-2 bg-[#D4AF37] rounded-full'
                      : 'w-2 h-2 bg-white/20 rounded-full hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// VIDEO CARD (Con Tracking de Click Mejorado)
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
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  // Tracking: Video Select con nombre específico
  const handleClick = () => {
    track(`[Select] ${video.title}`, { 
      id: video.id,
      category: video.category
    })
    onPlay()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer bg-[#111827] transition-all duration-700 ${
        isActive ? 'ring-2 ring-[#D4AF37]' : ''
      }`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(212, 175, 55, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <video
          src={video.videoUrl}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 brightness-75 group-hover:brightness-100"
          muted
          loop
          playsInline
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/50 to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-[#D4AF37] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_60px_rgba(212,175,55,0.5)]"
          >
            <Play className="w-8 h-8 text-[#0B1120] ml-1" fill="#0B1120" />
          </motion.div>
        </div>

        <div className="absolute top-5 right-5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10">
          <span className="text-white text-[11px] font-mono font-medium">{video.duration}</span>
        </div>

        <div className="absolute top-5 left-5">
          <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold bg-[#D4AF37]/20 text-[#D4AF37] backdrop-blur-xl border border-[#D4AF37]/20">
            {video.category}
          </span>
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-1">
          {video.title}
        </h3>
        
        <p className="text-white/40 text-sm leading-relaxed mb-6 line-clamp-2">
          {video.description}
        </p>

        <div className="flex items-center text-[#D4AF37]/70 text-xs uppercase tracking-[0.2em] font-medium group-hover:text-[#D4AF37] transition-colors">
          <span>Reproducir</span>
          <motion.div
            className="ml-2"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/0 to-transparent group-hover:via-[#D4AF37]/50 transition-all duration-700" />
    </motion.div>
  )
}

// ============================================================================
// VIDEO MODAL (Con Tracking de Progreso y Tiempo Mejorado)
// ============================================================================
const VideoModal = ({
  isOpen,
  video,
  onClose,
  onNext,
  onRandom,
  currentIndex,
  total
}: {
  isOpen: boolean
  video: VideoItem | null
  onClose: () => void
  onNext: () => void
  onRandom: () => void
  currentIndex: number
  total: number
}) => {
  const [showEndCTA, setShowEndCTA] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Tracking Refs
  const hasStartedRef = useRef(false)
  const progressMilestonesRef = useRef<Set<number>>(new Set())

  // Reset tracking when video changes
  useEffect(() => {
    setShowEndCTA(false)
    hasStartedRef.current = false
    progressMilestonesRef.current.clear()
  }, [video?.id])

  // Handle escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Tracking: Video Play Start con nombre específico
  const handlePlay = () => {
    if (!hasStartedRef.current && video) {
      track(`[Start] ${video.title}`, { 
        id: video.id,
        category: video.category
      })
      hasStartedRef.current = true
    }
  }

  // Tracking: Video Progress (25%, 50%, 75%) con nombre específico
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!video) return
    const v = e.currentTarget
    const percent = (v.currentTime / v.duration) * 100
    
    const milestones = [25, 50, 75]
    milestones.forEach(m => {
      if (percent >= m && !progressMilestonesRef.current.has(m)) {
        track(`[Progress ${m}%] ${video.title}`, { 
          id: video.id
        })
        progressMilestonesRef.current.add(m)
      }
    })
  }

  // Tracking: Video Complete con nombre específico
  const handleVideoEnd = () => {
    if (video) {
      track(`[Complete] ${video.title}`, { 
        id: video.id,
        duration: video.duration
      })
    }
    setShowEndCTA(true)
  }

  const handleNext = () => {
    setShowEndCTA(false)
    onNext()
  }

  const handleRandom = () => {
    setShowEndCTA(false)
    onRandom()
  }

  if (!video) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-[#0B1120]/98 backdrop-blur-2xl" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.7 }}
            className="relative w-full max-w-6xl bg-[#111827] rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-6 right-6 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-xl"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>

            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                src={video.videoUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                onPlay={handlePlay}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
              />

              <AnimatePresence>
                {showEndCTA && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#0B1120]/95 backdrop-blur-xl flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0.8, y: 30 }}
                      animate={{ scale: 1, y: 0 }}
                      className="text-center px-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B6914] flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(212,175,55,0.4)]"
                      >
                        <CheckCircle2 className="w-12 h-12 text-[#0B1120]" />
                      </motion.div>
                      
                      <h3 className="text-3xl font-bold text-white mb-3">¡Video completado!</h3>
                      <p className="text-white/50 mb-10 text-lg">¿Qué te gustaría hacer ahora?</p>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <ShinyButton onClick={handleNext} icon={ChevronRight}>
                          Siguiente Video
                        </ShinyButton>
                        <ShinyButton variant="ghost" onClick={handleRandom} icon={Shuffle}>
                          Video Aleatorio
                        </ShinyButton>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-8 bg-gradient-to-r from-[#111827] to-[#0B1120] flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#D4AF37]/10 text-[#D4AF37]">
                    {video.category}
                  </span>
                  <span className="text-white/30 text-sm">
                    {currentIndex + 1} de {total}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{video.title}</h2>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRandom}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-2 text-sm"
                >
                  <Shuffle className="w-4 h-4" />
                  Aleatorio
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E6C84D] text-[#0B1120] font-bold transition-all flex items-center gap-2 text-sm"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// VIDEO GALLERY
// ============================================================================
const VideoGallery = ({ initialVideoId }: { initialVideoId?: string }) => {
  const [seed, setSeed] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState('Todos')
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-50px" })

  useEffect(() => {
    setSeed(getSessionSeed())
  }, [])

  const shuffledVideos = useMemo(() => {
    if (seed === null) return videosData
    return seededShuffle(videosData, seed)
  }, [seed])

  const categories = ['Todos', ...new Set(videosData.map(v => v.category))]
  
  const filteredVideos = filter === 'Todos' 
    ? shuffledVideos 
    : shuffledVideos.filter(v => v.category === filter)

  useEffect(() => {
    if (initialVideoId && filteredVideos.length > 0) {
      const index = filteredVideos.findIndex(v => v.id === initialVideoId)
      if (index !== -1) {
        setSelectedIndex(index)
      }
    }
  }, [initialVideoId, filteredVideos])

  const handleReRandomize = () => {
    const newSeed = Date.now()
    sessionStorage.setItem('dramatizaciones-seed', newSeed.toString())
    setSeed(newSeed)
  }

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % filteredVideos.length)
    }
  }

  const handleRandom = () => {
    if (selectedIndex !== null) {
      let newIndex = Math.floor(Math.random() * filteredVideos.length)
      while (newIndex === selectedIndex && filteredVideos.length > 1) {
        newIndex = Math.floor(Math.random() * filteredVideos.length)
      }
      setSelectedIndex(newIndex)
    }
  }

  return (
    <section id="videos" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#0B1120]" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0a0f1a] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#060a12] to-transparent" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[200px] pointer-events-none" />

      <div ref={containerRef} className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
        >
          <div>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] mb-6">
              <Film className="w-3 h-3" />
              Catálogo Completo
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Dramatizaciones <span className="text-[#D4AF37]">Premium</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl">
              {filteredVideos.length} videos disponibles — sin favoritos ni destacados
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                    filter === cat
                      ? 'bg-[#D4AF37] text-[#0B1120] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                      : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReRandomize}
              className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              title="Re-ordenar aleatoriamente"
            >
              <Shuffle className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          layout
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredVideos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                index={index}
                onPlay={() => setSelectedIndex(index)}
                isActive={selectedIndex === index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <VideoModal
        isOpen={selectedIndex !== null}
        video={selectedIndex !== null ? filteredVideos[selectedIndex] : null}
        onClose={() => setSelectedIndex(null)}
        onNext={handleNext}
        onRandom={handleRandom}
        currentIndex={selectedIndex ?? 0}
        total={filteredVideos.length}
      />
    </section>
  )
}

// ============================================================================
// FOOTER
// ============================================================================
const Footer = () => (
  <footer className="relative py-16 overflow-hidden">
    <div className="absolute inset-0 bg-[#020617]" />
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

    <div className="container mx-auto px-6 lg:px-12 relative z-10">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-8 opacity-60">
          <div className="w-12 h-12">
            <img 
              src="/images/manuelsolis.png" 
              alt="Manuel Solis Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-white font-bold tracking-[0.2em] text-sm uppercase">Manuel Solis</span>
        </div>

        <p className="text-white/30 text-xs max-w-md leading-relaxed mb-6">
          © {new Date().getFullYear()} Material de capacitación confidencial.<br />
          Desarrollado para uso interno — Oficina San Luis Potosí.<br />
          Prohibida su distribución externa.
        </p>

        <a
          href="https://manuelsolis.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D4AF37]/50 hover:text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] transition-colors"
        >
          manuelsolis.com
        </a>
      </div>
    </div>
  </footer>
)

// ============================================================================
// MAIN APP
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
    <main className="bg-[#0B1120] min-h-screen text-white selection:bg-[#D4AF37] selection:text-black antialiased">
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
      `}</style>
    </main>
  )
}