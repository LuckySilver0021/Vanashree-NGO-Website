/**
 * Icon mapper — resolves CMS icon string keys to Tabler React icons.
 * Server-component safe: only imports used icons statically.
 */
import {
  IconTree,
  IconBook,
  IconDroplet,
  IconMapPin,
  IconHeart,
  IconSchool,
  IconLeaf,
  IconUsers,
  IconPlant,
  IconRecycle,
  IconMail,
  IconPhone,
  IconBrandInstagram,
  IconArrowRight,
  IconCalendar,
  IconClock,
  IconChevronRight,
  IconStar,
  IconTarget,
  IconEye,
  IconHandStop,
  IconBuildingCommunity,
  type Icon as TablerIcon,
} from '@tabler/icons-react'

const iconMap: Record<string, TablerIcon> = {
  tree: IconTree,
  book: IconBook,
  droplet: IconDroplet,
  'map-pin': IconMapPin,
  heart: IconHeart,
  school: IconSchool,
  leaf: IconLeaf,
  users: IconUsers,
  plant: IconPlant,
  recycle: IconRecycle,
  mail: IconMail,
  phone: IconPhone,
  instagram: IconBrandInstagram,
  'arrow-right': IconArrowRight,
  calendar: IconCalendar,
  clock: IconClock,
  'chevron-right': IconChevronRight,
  star: IconStar,
  target: IconTarget,
  eye: IconEye,
  volunteer: IconHandStop,
  community: IconBuildingCommunity,
}

interface DynamicIconProps {
  name: string
  size?: number
  stroke?: number
  className?: string
}

export function DynamicIcon({
  name,
  size = 24,
  stroke = 1.5,
  className = '',
}: DynamicIconProps) {
  const IconComponent = iconMap[name]
  if (!IconComponent) return null
  return <IconComponent size={size} stroke={stroke} className={className} />
}
