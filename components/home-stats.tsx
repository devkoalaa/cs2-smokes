'use client'

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Cloudy, Map as MapIcon, Users } from "lucide-react"

interface Stat {
  label: string
  value: string
  icon: 'map' | 'cloudy' | 'users'
}

const iconMap = {
  map: MapIcon,
  cloudy: Cloudy,
  users: Users,
}

export function HomeStats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon]
        return (
        <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
            whileHover={{ y: -5 }}
            className="h-full"
        >
            <Card className="group relative bg-card/50 backdrop-blur-sm border-border overflow-hidden h-full transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="relative p-6 text-center h-full flex flex-col justify-center z-10">
                <div className="flex justify-center mb-4">
                  <motion.div 
                    className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors" />
                  </motion.div>
                </div>
                <motion.div 
                  className="text-3xl font-bold text-card-foreground mb-2 tracking-tight"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100, delay: 0.5 + (index * 0.1) }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                
                {/* Decorative background element */}
                <div className="absolute -bottom-6 -right-6 opacity-0 group-hover:opacity-5 transition-all duration-500 transform group-hover:scale-150 group-hover:-rotate-12 pointer-events-none">
                    <Icon className="w-24 h-24" />
                </div>
              </CardContent>
            </Card>
        </motion.div>
      )})}
    </div>
  )
}
