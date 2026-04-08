import { motion } from 'framer-motion'
import { 
  BarChart3, Zap, Users, Package, Megaphone, Wallet, Brain, Shield, 
  TrendingUp, Handshake, Sparkles, Bot, MessageSquare, Cpu, Globe,
  Code, LineChart, ShoppingCart, Heart, Target, Coins, Database, Lock
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{size?: number, className?: string}>> = {
  zara: BarChart3,
  kofi: Zap,
  amara: Users,
  idris: Package,
  nala: Megaphone,
  tariq: Wallet,
  sana: Brain,
  ravi: Shield,
  luna: TrendingUp,
  omar: Handshake,
  bot: Bot,
  message: MessageSquare,
  sparkles: Sparkles,
  cpu: Cpu,
  globe: Globe,
  code: Code,
  chart: LineChart,
  cart: ShoppingCart,
  heart: Heart,
  target: Target,
  coins: Coins,
  database: Database,
  lock: Lock,
}

interface AnimatedIconProps {
  name: string
  size?: number
  color?: string
  animate?: boolean
  className?: string
}

export function AnimatedIcon({ name, size = 20, color, animate = true, className = '' }: AnimatedIconProps) {
  const Icon = iconMap[name] || Sparkles
  
  if (!animate) {
    return <Icon size={size} className={className} style={{ color }} />
  }

  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Icon size={size} className={className} style={{ color }} />
    </motion.div>
  )
}

export function PulsingIcon({ name, size = 20, color, className = '' }: AnimatedIconProps) {
  const Icon = iconMap[name] || Sparkles
  
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
        opacity: [1, 0.8, 1]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Icon size={size} className={className} style={{ color }} />
    </motion.div>
  )
}

export function BouncingIcon({ name, size = 20, color, className = '' }: AnimatedIconProps) {
  const Icon = iconMap[name] || Sparkles
  
  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Icon size={size} className={className} style={{ color }} />
    </motion.div>
  )
}

export function RotatingIcon({ name, size = 20, color, className = '' }: AnimatedIconProps) {
  const Icon = iconMap[name] || Sparkles
  
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <Icon size={size} className={className} style={{ color }} />
    </motion.div>
  )
}

export function AgentIcon({ agentId, color, size = 18 }: { agentId: string, color: string, size?: number }) {
  const icons: Record<string, string> = {
    zara: 'chart',
    kofi: 'zap',
    amara: 'users',
    idris: 'package',
    nala: 'target',
    tariq: 'coins',
    sana: 'brain',
    ravi: 'lock',
    luna: 'trending',
    omar: 'handshake',
  }
  
  return (
    <motion.div
      className="rounded-lg flex items-center justify-center"
      style={{ 
        background: `linear-gradient(135deg, ${color}60, ${color}30)`,
        width: size * 1.8,
        height: size * 1.8,
        border: `1px solid ${color}50`
      }}
      whileHover={{ scale: 1.1, rotate: 3 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <AnimatedIcon 
        name={icons[agentId] || 'sparkles'} 
        size={size} 
        color={color}
      />
    </motion.div>
  )
}

export default AnimatedIcon
