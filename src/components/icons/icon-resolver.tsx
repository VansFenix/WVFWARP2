'use client';

import { FaDiscord, FaYoutube, FaTwitter, FaFacebook, FaGithub } from 'react-icons/fa';
import { FaTelegram, FaSignalMessenger } from 'react-icons/fa6';
import { IoLogoWhatsapp } from 'react-icons/io';
import { RiInstagramFill, RiNetflixFill } from 'react-icons/ri';
import { SiSpotify } from 'react-icons/si';
import { TbBoxMultipleFilled } from 'react-icons/tb';
import { RuTrackerIcon, KinozalIcon } from './custom-icons';
import type { IconType } from 'react-icons';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FaDiscord,
  FaYoutube,
  FaTwitter,
  FaFacebook,
  FaTelegram,
  FaSignalMessenger,
  FaGithub,
  IoLogoWhatsapp,
  RiInstagramFill,
  RiNetflixFill,
  SiSpotify,
  TbBoxMultipleFilled,
  RuTrackerIcon,
  KinozalIcon,
};

const FALLBACK = TbBoxMultipleFilled;

interface ServiceIconProps {
  icon: string;
  className?: string;
}

export function ServiceIcon({ icon, className = 'w-5 h-5' }: ServiceIconProps) {
  const Component = ICON_MAP[icon] || FALLBACK;
  return <Component className={className} />;
}

export function hasIcon(icon: string): boolean {
  return icon in ICON_MAP;
}
