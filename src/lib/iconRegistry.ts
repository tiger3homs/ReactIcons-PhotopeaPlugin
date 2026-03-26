import * as Fa6 from 'react-icons/fa6';
import * as Md from 'react-icons/md';
import * as Ai from 'react-icons/ai';
import * as Bi from 'react-icons/bi';
import * as Hi from 'react-icons/hi';
import * as Lu from 'react-icons/lu';

export interface IconMetadata {
  id: string;
  name: string;
  component: any;
  library: string;
}

export interface LibraryMetadata {
  id: string;
  name: string;
  prefix: string;
  count: number;
}

const libraries: LibraryMetadata[] = [
  { id: 'fa6', name: 'Font Awesome 6', prefix: 'Fa', count: Object.keys(Fa6).length },
  { id: 'md', name: 'Material Design', prefix: 'Md', count: Object.keys(Md).length },
  { id: 'ai', name: 'Ant Design', prefix: 'Ai', count: Object.keys(Ai).length },
  { id: 'bi', name: 'BoxIcons', prefix: 'Bi', count: Object.keys(Bi).length },
  { id: 'hi', name: 'HeroIcons', prefix: 'Hi', count: Object.keys(Hi).length },
  { id: 'lu', name: 'Lucide', prefix: 'Lu', count: Object.keys(Lu).length },
];

// We lazy-load icons to avoid massive initial bundle if possible, 
// but for a plugin we might just load them all if the memory allows.
// Given the 10k+ requirement, we'll index them.

export const getAllIcons = (libraryId?: string): IconMetadata[] => {
  const all: IconMetadata[] = [];

  const addIcons = (lib: any, id: string) => {
    if (libraryId && libraryId !== id) return;
    Object.entries(lib).forEach(([name, component]) => {
      all.push({
        id: `${id}-${name}`,
        name,
        component,
        library: id,
      });
    });
  };

  addIcons(Fa6, 'fa6');
  addIcons(Md, 'md');
  addIcons(Ai, 'ai');
  addIcons(Bi, 'bi');
  addIcons(Hi, 'hi');
  addIcons(Lu, 'lu');

  return all;
};

export const getIconById = (id: string): IconMetadata | undefined => {
  const [libId, name] = id.split('-');
  const libMap: Record<string, any> = {
    fa6: Fa6,
    md: Md,
    ai: Ai,
    bi: Bi,
    hi: Hi,
    lu: Lu,
  };
  
  const lib = libMap[libId];
  if (!lib || !lib[name]) return undefined;
  
  return {
    id,
    name,
    component: lib[name],
    library: libId,
  };
};

export { libraries };
