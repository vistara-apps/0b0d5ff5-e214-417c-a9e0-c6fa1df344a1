import { Map as GameMap } from './types';

export const MAPS: Record<string, GameMap> = {
  classic: {
    id: 'classic',
    name: 'Classic Arena',
    difficulty: 1,
    obstacles: [],
    unlockLevel: 1,
    thumbnailUrl: '/maps/classic.png'
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Maze',
    difficulty: 2,
    obstacles: [
      {
        type: 'wall',
        coordinates: [
          [5, 5], [5, 6], [5, 7], [5, 8], [5, 9], [5, 10], [5, 11], [5, 12], [5, 13], [5, 14],
          [15, 5], [15, 6], [15, 7], [15, 8], [15, 9], [15, 10], [15, 11], [15, 12], [15, 13], [15, 14],
          [8, 8], [9, 8], [10, 8], [11, 8], [12, 8],
          [8, 12], [9, 12], [10, 12], [11, 12], [12, 12],
        ]
      }
    ],
    unlockLevel: 3,
    thumbnailUrl: '/maps/cyber.png'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Depths',
    difficulty: 3,
    obstacles: [
      {
        type: 'wall',
        coordinates: [
          [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
          [13, 3], [14, 3], [15, 3], [16, 3], [17, 3],
          [3, 17], [4, 17], [5, 17], [6, 17], [7, 17],
          [13, 17], [14, 17], [15, 17], [16, 17], [17, 17],
          [10, 8], [10, 9], [10, 10], [10, 11], [10, 12],
          [8, 10], [9, 10], [11, 10], [12, 10],
        ]
      }
    ],
    unlockLevel: 5,
    thumbnailUrl: '/maps/ocean.png'
  },
  fire: {
    id: 'fire',
    name: 'Volcanic Chambers',
    difficulty: 4,
    obstacles: [
      {
        type: 'wall',
        coordinates: [
          [2, 2], [3, 2], [4, 2], [5, 2],
          [15, 2], [16, 2], [17, 2], [18, 2],
          [2, 18], [3, 18], [4, 18], [5, 18],
          [15, 18], [16, 18], [17, 18], [18, 18],
          [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7], [13, 7],
          [7, 13], [8, 13], [9, 13], [10, 13], [11, 13], [12, 13], [13, 13],
          [10, 5], [10, 6], [10, 15], [10, 16],
        ]
      }
    ],
    unlockLevel: 8,
    thumbnailUrl: '/maps/fire.png'
  },
  zen: {
    id: 'zen',
    name: 'Zen Garden',
    difficulty: 2,
    obstacles: [
      {
        type: 'wall',
        coordinates: [
          [9, 9], [10, 9], [11, 9],
          [9, 10], [11, 10],
          [9, 11], [10, 11], [11, 11],
        ]
      }
    ],
    unlockLevel: 1,
    thumbnailUrl: '/maps/zen.png'
  },
};

export function getMapById(mapId: string): GameMap | undefined {
  return MAPS[mapId];
}

export function getAvailableMapsForLevel(level: number): GameMap[] {
  return Object.values(MAPS).filter(map => map.unlockLevel <= level);
}

