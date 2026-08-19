export const categories = ['All', 'Restaurants', 'Cafes', 'Gas Stations', 'Shopping', 'Parks', 'Services'];

export const places = [
  { id: '1', name: 'Kleenest Coffee House', category: 'Cafes', rating: 4.8, distance: '0.4 mi', description: 'A local coffee stop with a welcoming atmosphere.', address: '12 Main Street', reviews: 38 },
  { id: '2', name: 'Main Street Market', category: 'Restaurants', rating: 4.6, distance: '0.7 mi', description: 'A neighborhood restaurant serving the local community.', address: '24 Main Street', reviews: 51 },
  { id: '3', name: 'River Road Fuel', category: 'Gas Stations', rating: 4.4, distance: '1.1 mi', description: 'Convenient fuel and everyday essentials.', address: '101 River Road', reviews: 22 },
  { id: '4', name: 'Downtown Goods', category: 'Shopping', rating: 4.7, distance: '1.3 mi', description: 'Independent local shopping and specialty goods.', address: '7 Market Avenue', reviews: 17 },
  { id: '5', name: 'Riverside Park', category: 'Parks', rating: 4.9, distance: '1.8 mi', description: 'A clean outdoor space for walks, recreation, and events.', address: '1 Riverside Drive', reviews: 29 },
];

export function getPlace(id) {
  return places.find((place) => place.id === id);
}
