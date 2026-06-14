'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { PLATFORM_CONFIG } from '@/lib/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Send,
  Instagram,
  Phone,
  ArrowRight,
} from 'lucide-react'

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const DARK_BG = '#0B1426'
const PRIMARY = '#EC4899'
const AMBER = '#F59E0B'
const WARM_PEACH = '#FFF5F0'

/* ──────────────────────────── ANIMATIONS ──────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

/* ──────────────────────────── CONTAINER ──────────────────────────── */
function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1400px] px-5 sm:px-8 md:px-12 lg:px-16 ${className}`}>
      {children}
    </div>
  )
}

/* ──────────────────────────── HERO BANNER ──────────────────────────── */
function HeroBanner() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-32" style={{ backgroundColor: DARK_BG }}>
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1426] via-[#111c38] to-[#1a1f3a]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-20 right-[20%] w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[10%] w-[500px] h-[500px] bg-amber-500/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/4 rounded-full blur-[150px]" />
      </div>

      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 px-5 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/15 hover:bg-white/15 backdrop-blur-sm inline-flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Support & Contact
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-[52px] lg:text-[56px] font-bold tracking-tight leading-[1.08] text-white"
          >
            <span className="bg-gradient-to-r from-[#EC4899] via-[#F59E0B] to-[#EC4899] bg-clip-text text-transparent">
              Contactez-nous
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Une question ? Nous sommes là pour vous aider.
          </motion.p>
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── CONTACT FORM ──────────────────────────── */
const subjectOptions = [
  { value: 'general', label: 'Question générale' },
  { value: 'technique', label: 'Support technique' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'autre', label: 'Autre' },
]

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate a short delay then show toast
    setTimeout(() => {
      toast.success('Message envoyé ! Nous vous répondrons sous 24h.')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
    }, 800)
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">
        Envoyez-nous un message
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nom complet */}
        <div className="space-y-2">
          <Label htmlFor="contact-name" className="text-gray-700 font-medium">
            Nom complet
          </Label>
          <Input
            id="contact-name"
            placeholder="Entrez votre nom complet"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-gray-700 font-medium">
            Email
          </Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="exemple@email.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors"
          />
        </div>

        {/* Sujet */}
        <div className="space-y-2">
          <Label htmlFor="contact-subject" className="text-gray-700 font-medium">
            Sujet
          </Label>
          <Select
            value={formData.subject}
            onValueChange={(value) => handleChange('subject', value)}
            required
          >
            <SelectTrigger id="contact-subject" className="w-full h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors">
              <SelectValue placeholder="Sélectionnez un sujet" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {subjectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="contact-message" className="text-gray-700 font-medium">
            Message
          </Label>
          <Textarea
            id="contact-message"
            placeholder="Décrivez votre question ou demande..."
            rows={5}
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            required
            className="rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors resize-none"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-full font-semibold text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 mt-3"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              Envoi en cours...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Envoyer le message
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}

/* ──────────────────────────── CONTACT INFO CARDS ──────────────────────────── */
const contactCards = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+221 78 485 82 26',
    href: 'https://wa.me/${PLATFORM_CONFIG.DEFAULT_WHATSAPP}',
    color: '#25D366',
    bgColor: 'rgba(37, 211, 102, 0.1)',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@boutiko.pro',
    href: 'mailto:contact@boutiko.pro',
    color: PRIMARY,
    bgColor: 'rgba(236, 72, 153, 0.1)',
  },
  {
    icon: MapPin,
    label: 'Adresse',
    value: 'Dakar, Sénégal',
    href: null,
    color: AMBER,
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
]

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: '#', color: '#E1306C' },
  { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/${PLATFORM_CONFIG.DEFAULT_WHATSAPP}', color: '#25D366' },
  { icon: Phone, label: 'Twitter / X', href: '#', color: '#1DA1F2' },
]

function ContactInfoCards() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Nos coordonnées
        </h2>
        <p className="text-gray-500 text-sm">
          Vous pouvez aussi nous joindre directement via ces canaux.
        </p>
      </div>

      {/* Info Cards */}
      <div className="space-y-4">
        {contactCards.map((card, i) => {
          const CardWrapper = card.href ? 'a' : 'div'
          return (
            <motion.div
              key={i}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <CardWrapper
                {...(card.href
                  ? {
                      href: card.href,
                      target: card.href.startsWith('mailto') ? undefined : '_blank',
                      rel: card.href.startsWith('mailto') ? undefined : 'noopener noreferrer',
                    }
                  : {})}
                className="block"
              >
                <Card className="rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group overflow-hidden cursor-pointer">
                  <CardContent className="py-5 px-5 flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: card.bgColor }}
                    >
                      <card.icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {card.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
                        {card.value}
                      </p>
                    </div>
                    {card.href && (
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                    )}
                  </CardContent>
                </Card>
              </CardWrapper>
            </motion.div>
          )
        })}
      </div>

      {/* Social Links */}
      <div className="pt-4">
        <p className="text-sm font-semibold text-gray-700 mb-4">Nos réseaux sociaux</p>
        <div className="flex gap-3">
          {socialLinks.map((social, i) => (
            <motion.a
              key={i}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:shadow-md hover:border-gray-300 transition-all duration-300 group"
              title={social.label}
            >
              <social.icon
                className="w-5 h-5 text-gray-400 group-hover:scale-110 transition-transform duration-300"
                style={{ color: undefined }}
              />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────── CONTACT CONTENT SECTION ──────────────────────────── */
function ContactContentSection() {
  return (
    <section className="relative py-20 md:py-28 lg:py-32 bg-white">
      {/* Subtle glow accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.03] rounded-full blur-[120px]" />

      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20"
        >
          {/* Left Column - Form */}
          <motion.div variants={fadeInUp}>
            <ContactForm />
          </motion.div>

          {/* Right Column - Info Cards */}
          <motion.div variants={fadeInUp}>
            <ContactInfoCards />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── MAP / LOCATION SECTION ──────────────────────────── */
function LocationSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-32" style={{ backgroundColor: WARM_PEACH }}>
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[100px]" />

      <Container>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="relative z-10"
        >
          {/* Title */}
          <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-semibold bg-primary/10 text-primary border-primary/20">
              Localisation
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
              Où nous{' '}
              <span className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] bg-clip-text text-transparent">
                trouver
              </span>
            </h2>
          </motion.div>

          {/* Location Card */}
          <motion.div variants={scaleIn} className="max-w-3xl mx-auto">
            <Card className="rounded-2xl border border-orange-100 shadow-xl shadow-orange-100/30 overflow-hidden">
              <CardContent className="p-0">
                {/* Google Maps Embed */}
                <div className="relative w-full" style={{ height: '400px' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61836.08858422!2d-17.490739!3d14.716677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec172f5e3b8e761%3A0x5e5aafe21e0be01!2sDakar%2C%20S%C3%A9n%C3%A9gal!5e0!3m2!1sfr!2ssn!4v1700000000000!5m2!1sfr!2ssn"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Boutiko - Dakar, Sénégal"
                  />
                </div>

                {/* Location details */}
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    {/* Address */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">Dakar, Sénégal</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Notre équipe est basée au cœur de Dakar
                        </p>
                      </div>
                    </div>

                    {/* Business Hours */}
                    <div className="flex items-start gap-4 sm:text-right">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">Horaires d'ouverture</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Lun-Ven : 9h - 18h
                        </p>
                        <p className="text-sm text-gray-500">
                          Sam : 9h - 13h
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

/* ──────────────────────────── CONTACT PAGE ──────────────────────────── */
export function ContactPage() {
  return (
    <main>
      <HeroBanner />
      <ContactContentSection />
      <LocationSection />
    </main>
  )
}
