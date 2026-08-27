const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ children, size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...props}>
      {children}
    </svg>
  );
}

export const PawIcon = (props) => (
  <Svg {...props}>
    <circle cx="7" cy="9" r="2" />
    <circle cx="12" cy="6.5" r="2" />
    <circle cx="17" cy="9" r="2" />
    <circle cx="19" cy="14" r="2" />
    <path d="M12 12c-3.3 0-6 2.2-6 5.2 0 2 1.7 2.8 3.3 2.1 1-.4 1.8-1 2.7-1 .9 0 1.7.6 2.7 1 1.6.7 3.3-.1 3.3-2.1 0-3-2.7-5.2-6-5.2Z" />
  </Svg>
);

export const SearchIcon = (props) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </Svg>
);

export const BellIcon = (props) => (
  <Svg {...props}>
    <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </Svg>
);

export const HeartIcon = ({ filled, ...props }) => (
  <Svg {...props} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.5s-7.5-4.6-9.8-9.4C.6 7.7 2 4.2 5.4 3.4c2-.5 4 .3 5.1 2 .3.5 1.1.5 1.4 0 1.1-1.7 3.1-2.5 5.1-2 3.4.8 4.8 4.3 3.2 7.7C19.5 15.9 12 20.5 12 20.5Z" />
  </Svg>
);

export const MessageIcon = (props) => (
  <Svg {...props}>
    <path d="M4 5h16v11H8.5L4 19.5V5Z" />
  </Svg>
);

export const UserIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20c1-3.6 4-5.6 7-5.6s6 2 7 5.6" />
  </Svg>
);

export const PlusIcon = (props) => (
  <Svg {...props}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const MapPinIcon = (props) => (
  <Svg {...props}>
    <path d="M12 21s7-6.6 7-11.6A7 7 0 0 0 5 9.4C5 14.4 12 21 12 21Z" />
    <circle cx="12" cy="9.4" r="2.4" />
  </Svg>
);

export const CheckIcon = (props) => (
  <Svg {...props}>
    <path d="m5 12 5 5 9-10" />
  </Svg>
);

export const XIcon = (props) => (
  <Svg {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const ChevronDownIcon = (props) => (
  <Svg {...props}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const LogOutIcon = (props) => (
  <Svg {...props}>
    <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
    <path d="M9 12h11m0 0-3.5-3.5M20 12l-3.5 3.5" />
  </Svg>
);

export const ShieldIcon = (props) => (
  <Svg {...props}>
    <path d="M12 3 5 6v5.5c0 4.8 3 8 7 9.5 4-1.5 7-4.7 7-9.5V6l-7-3Z" />
  </Svg>
);

export const CameraIcon = (props) => (
  <Svg {...props}>
    <path d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z" />
    <circle cx="12" cy="13.5" r="3.3" />
  </Svg>
);

export const TrashIcon = (props) => (
  <Svg {...props}>
    <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m1 0-1 13H9L8 7" />
  </Svg>
);

export const EditIcon = (props) => (
  <Svg {...props}>
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
  </Svg>
);

export const ArrowLeftIcon = (props) => (
  <Svg {...props}>
    <path d="M19 12H5m0 0 6 6m-6-6 6-6" />
  </Svg>
);

export const FilterIcon = (props) => (
  <Svg {...props}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Svg>
);

export const MenuIcon = (props) => (
  <Svg {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const SendIcon = (props) => (
  <Svg {...props}>
    <path d="m4 12 16-7-6.5 16-2.5-7-7-2Z" />
  </Svg>
);

export const ArchiveIcon = (props) => (
  <Svg {...props}>
    <path d="M4 6h16v3H4V6Z" />
    <path d="M6 9h12v9H6V9Z" />
    <path d="M10 13h4" />
  </Svg>
);

export const AlertIcon = (props) => (
  <Svg {...props}>
    <path d="M12 4 21 19H3L12 4Z" />
    <path d="M12 10v4M12 17v.01" />
  </Svg>
);

export const WhatsAppIcon = (props) => (
  <Svg {...props}>
    <path d="M7 17.5 4.5 20 5 16a8 8 0 1 1 3.5 3l-1.5-1.5Z" />
    <path d="M9 10c0 3 2 5 5 5" />
  </Svg>
);

export const MailIcon = (props) => (
  <Svg {...props}>
    <path d="M4 6h16v12H4V6Z" />
    <path d="m4 7 8 6 8-6" />
  </Svg>
);

export const DogIcon = (props) => (
  <Svg {...props}>
    <path d="M5 9c-1.5 0-2.5 1.3-2.5 2.8 0 1.2.8 2 1.8 2.2" />
    <path d="M19 9c1.5 0 2.5 1.3 2.5 2.8 0 1.2-.8 2-1.8 2.2" />
    <path d="M6.5 9.5C6.5 6.5 9 5 12 5s5.5 1.5 5.5 4.5c0 1.5-.5 2.3-.5 3.8 0 3-2 5.2-5 5.2s-5-2.2-5-5.2c0-1.5-.5-2.3-.5-3.8Z" />
    <circle cx="10" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="14" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
    <path d="M11 14h2" />
  </Svg>
);

export const CatIcon = (props) => (
  <Svg {...props}>
    <path d="m6 5 1.5 4M18 5l-1.5 4" />
    <path d="M7.5 9c0-.5 1-1 4.5-1s4.5.5 4.5 1c1.5 1 2 2.8 2 4.5 0 3.3-2.9 5.5-6.5 5.5S5.5 16.8 5.5 13.5c0-1.7.5-3.5 2-4.5Z" />
    <circle cx="10" cy="12.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="14" cy="12.5" r="0.6" fill="currentColor" stroke="none" />
    <path d="M11 14.5h2" />
  </Svg>
);

export const RabbitIcon = (props) => (
  <Svg {...props}>
    <path d="M9 10c-1-2.5-1.5-5-.5-6.5C9.5 2.5 10.5 4 10.5 7" />
    <path d="M15 10c1-2.5 1.5-5 .5-6.5-1-1-2 .5-2 3.5" />
    <ellipse cx="12" cy="14" rx="5.5" ry="5" />
    <circle cx="10" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="14" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
    <path d="M11 16h2" />
  </Svg>
);

export const BirdIcon = (props) => (
  <Svg {...props}>
    <path d="M6 13c0-3.5 2.8-6 6.3-6 3 0 5.2 1.8 5.7 4.3.3 1.5-.5 2.7-2 2.7h-.5" />
    <path d="M15.5 11.3 18.5 10l-1 3" />
    <circle cx="14.5" cy="9" r="0.6" fill="currentColor" stroke="none" />
    <path d="M6 13c-1.3 0-2.5-.6-3-1.7C5 12 6 12.3 7 12" />
    <path d="M9 15.5 7 19M12.5 16 12 19.5" />
  </Svg>
);

export const RodentIcon = (props) => (
  <Svg {...props}>
    <circle cx="9" cy="7.5" r="2" />
    <circle cx="14.5" cy="6.5" r="1.6" />
    <path d="M6 12c0-2.5 2.5-4.5 6-4.5s6.5 2 6.5 5c0 3-2.5 5-6.5 5-2.5 0-4-1.2-4-1.2" />
    <circle cx="9.5" cy="11.5" r="0.5" fill="currentColor" stroke="none" />
    <path d="M4.5 14.5c1-.5 2-.3 2.5.5" />
  </Svg>
);

export const FishIcon = (props) => (
  <Svg {...props}>
    <path d="M4 12c3-4 8-5.5 12-3.5 2 1 3.5 2.2 4 3.5-.5 1.3-2 2.5-4 3.5-4 2-9 .5-12-3.5Z" />
    <path d="M20 12 22 9.5M20 12l2 2.5" />
    <circle cx="9" cy="11" r="0.7" fill="currentColor" stroke="none" />
  </Svg>
);

export const ReptileIcon = (props) => (
  <Svg {...props}>
    <path d="M3 15c1.5-3 4-4.5 7-4.5 1.5-2.5 4-3.5 6.5-3 2 .4 3.5 1.7 4 3.5-1 .3-2 .2-2.7-.3" />
    <path d="M10 10.5c1.5 1 2.5 2.7 2.5 4.5 0 2-1.5 3.5-4 3.5S4 17 4 15c0 0 .3-1 1-1.5" />
    <circle cx="17.5" cy="9.5" r="0.6" fill="currentColor" stroke="none" />
    <path d="M12.5 16.5 14 18.5M9.5 17 9 19" />
  </Svg>
);
