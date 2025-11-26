"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Map } from "@/lib/services/maps.service"
import { motion } from "framer-motion"
import { MapPin, Play } from "lucide-react"

interface MapCardProps {
  map: Map
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}

export function MapCard({ map, isHovered, onMouseEnter, onMouseLeave, onClick }: MapCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isHovered ? 1.05 : 1,
        filter: "none",
        zIndex: isHovered ? 50 : 1
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="h-full cursor-pointer"
    >
      <Card
        className={`group relative h-full overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all duration-500 p-0 gap-0
          ${isHovered ? 'shadow-2xl shadow-primary/20 border-primary' : 'hover:border-primary/50'}
        `}
      >
        <div className="relative h-full flex flex-col">
          {/* Image Section */}
          <div className="relative overflow-hidden h-52">
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${map.thumbnail || "/placeholder.svg"})` }}
              animate={{
                scale: isHovered ? 1.15 : 1,
                rotate: isHovered ? 1 : 0
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

            {/* Top Badges */}
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <Badge className="bg-background/80 backdrop-blur-md text-foreground border border-border/50 shadow-sm">
                {(map.smokesCount ?? 0)} smoke{(map.smokesCount ?? 0) !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Large Background Icon */}
            <div className={`absolute -bottom-4 -right-4 text-primary/5 transition-all duration-500 transform
              ${isHovered ? 'opacity-100 scale-110 -rotate-12' : 'opacity-0'}
            `}>
              <MapPin className="w-32 h-32" />
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="flex-1 p-6 relative z-10 flex flex-col border-t border-border/50 bg-card/50">
            <div className="mb-3">
              <h3 className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${isHovered ? 'text-primary' : ''}`}>
                {map.displayName || map.name}
              </h3>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-6 flex-1">
              {map.description || 'Explore as melhores smokes, granadas e estratégias táticas para dominar este mapa.'}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
              <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider ${map.isActive ? 'text-muted-foreground' : 'text-destructive'}`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${map.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${map.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </span>
                {map.isActive ? 'Mapa Ativo' : 'Mapa Inativo'}
              </div>

              <Button
                size="sm"
                className="relative overflow-hidden group/btn bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20"
              >
                <span className="relative z-10 flex items-center font-medium">
                  Ver Smokes
                  <Play className={`ml-2 w-3 h-3 transition-transform ${isHovered ? 'translate-x-1 scale-110' : ''}`} />
                </span>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}
