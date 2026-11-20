/* eslint-disable */
// The people of the mock. The first twelve are the original cast (ids 1-12, relied on by docs and tests);
// the rest make the network feel inhabited: different disciplines, some without an avatar, a cover or a bio.
//   cat   primary category id (1 Art, 2 Photography, 3 Design, 4 Fashion)
//   posts how much they post, relative to the others (a few prolific people, many quiet ones)
//   fame  0..1, how likely others are to follow them and love their work
//   hire / collab  availability flags; noAvatar / noCover  accounts that never uploaded one
const PEOPLE = [
  { username: 'ada', name: 'Ada Lindqvist', bio: 'Generative artist working with plotters and light.', location: 'Stockholm', links: ['adalindqvist.example.com', 'github.example.com/adal'], cat: 1, posts: 10, fame: 0.7 },
  { username: 'grace', name: 'Grace Okonkwo', bio: 'Documentary photographer. Lagos / London.', location: 'Lagos', links: ['graceokonkwo.example.com'], cat: 2, posts: 8, fame: 0.9 },
  { username: 'mara', name: 'Mara Delgado', bio: 'Illustrator, zine maker, coffee person.', location: 'Mexico City', links: ['maradelgado.example.com', 'shop.example.com/mara'], cat: 1, posts: 9, fame: 0.8 },
  { username: 'jules', name: 'Jules Beaumont', bio: 'Type designer. I draw letters for a living.', location: 'Lyon', links: ['beaumont-type.example.com'], cat: 3, posts: 6, fame: 0.6 },
  { username: 'theo', name: 'Theo Nakamura', bio: 'Street photography and film cameras.', location: 'Osaka', links: ['theonakamura.example.com'], cat: 2, posts: 10, fame: 0.75 },
  { username: 'noor', name: 'Noor Haddad', bio: 'Motion designer and sometimes painter.', location: 'Amman', links: ['noorhaddad.example.com', 'vimeo.example.com/noor'], cat: 3, posts: 5, fame: 0.55, noCover: true },
  { username: 'ines', name: 'Ines Carvalho', bio: 'Fashion editor, collage artist.', location: 'Lisbon', links: [], cat: 4, posts: 6, fame: 0.5 },
  { username: 'kofi', name: 'Kofi Mensah', bio: 'Architecture student, concrete enthusiast.', location: 'Accra', links: [], cat: 3, posts: 4, fame: 0.3 },
  { username: 'saoirse', name: 'Saoirse Brennan', bio: 'Ceramics and printmaking.', location: 'Galway', links: ['saoirsebrennan.example.com'], cat: 1, posts: 6, fame: 0.5 },
  { username: 'luca', name: 'Luca Ferrante', bio: '3D artist. Mostly clay renders.', location: 'Milan', links: ['lucaferrante.example.com'], cat: 3, posts: 5, fame: 0.45, noCover: true },
  { username: 'yuki', name: 'Yuki Tanaka', bio: 'Watercolors, tiny comics.', location: 'Kyoto', links: ['yukitanaka.example.com'], cat: 1, posts: 7, fame: 0.65 },
  { username: 'amara', name: 'Amara Singh', bio: 'Brand designer and part-time muralist.', location: 'Toronto', links: ['amarasingh.example.com'], cat: 3, posts: 4, fame: 0.4 },

  { username: 'dario', name: 'Dario Vené', bio: 'Risograph printer. Two drums, forty colours I can not afford.', location: 'Buenos Aires', links: ['tintafresca.example.com'], cat: 3, posts: 6, fame: 0.5, hire: true },
  { username: 'lena', name: 'Lena Fischer', bio: 'Weaver. Wool, linen and a loom older than me.', location: 'Berlin', links: ['lenafischer.example.com'], cat: 4, posts: 4, fame: 0.45, collab: true },
  { username: 'omar', name: 'Omar Rahimi', bio: 'Calligraphy, lettering and the occasional shop sign.', location: 'Istanbul', links: ['omarrahimi.example.com'], cat: 3, posts: 5, fame: 0.55, hire: true, collab: true },
  { username: 'tessa', name: 'Tessa van Dijk', bio: 'Landscapes, mostly flat ones. Large format when my back allows it.', location: 'Utrecht', links: ['tessavandijk.example.com'], cat: 2, posts: 7, fame: 0.6, hire: true },
  { username: 'bao', name: 'Bao Nguyen', bio: 'Pixel art and small games about ordinary days.', location: 'Ho Chi Minh City', links: ['baonguyen.example.com', 'itch.example.com/bao'], cat: 1, posts: 5, fame: 0.5, collab: true, noCover: true },
  { username: 'wren', name: 'Wren Calloway', bio: 'Tattooer. Botanical linework, books open quarterly.', location: 'Portland', links: ['wrencalloway.example.com'], cat: 1, posts: 5, fame: 0.7, hire: true },
  { username: 'sol', name: 'Sol Ibarra', bio: 'Sculpture in steel and whatever the scrapyard has this week.', location: 'Bilbao', links: [], cat: 1, posts: 3, fame: 0.35 },
  { username: 'priya', name: 'Priya Raman', bio: 'Hand embroidery. Slow on purpose.', location: 'Chennai', links: ['priyaraman.example.com'], cat: 4, posts: 5, fame: 0.5, hire: true, collab: true },
  { username: 'emeka', name: 'Emeka Obi', bio: 'Furniture maker. Chairs, mostly. Stools when I am tired.', location: 'Enugu', links: ['obiworkshop.example.com'], cat: 3, posts: 3, fame: 0.4, hire: true, noCover: true },
  { username: 'hana', name: 'Hana Kovač', bio: 'Bookbinder and paper hoarder.', location: 'Ljubljana', links: ['hanakovac.example.com'], cat: 1, posts: 3, fame: 0.3, collab: true },
  { username: 'felix', name: 'Felix Aubert', bio: 'Cinematographer. Stills from things that may never come out.', location: 'Montréal', links: ['felixaubert.example.com', 'vimeo.example.com/felixaubert'], cat: 2, posts: 5, fame: 0.6, hire: true },
  { username: 'zadie', name: 'Zadie Marsh', bio: 'Gig posters and record sleeves for bands you will hear about later.', location: 'Bristol', links: ['zadiemarsh.example.com', 'shop.example.com/zadie'], cat: 3, posts: 6, fame: 0.65, hire: true, collab: true },
  { username: 'ravi', name: 'Ravi Menon', bio: 'Creative coder. Shaders, plotters, bugs I decided to keep.', location: 'Bengaluru', links: ['ravimenon.example.com', 'github.example.com/ravim'], cat: 1, posts: 5, fame: 0.5, collab: true },
  { username: 'mio', name: 'Mio Sato', bio: 'Metalsmith. Rings and small silver objects.', location: 'Sapporo', links: ['miosato.example.com'], cat: 4, posts: 3, fame: 0.35, hire: true, noCover: true },
  { username: 'caleb', name: 'Caleb Ortiz', bio: '', location: '', links: [], cat: 1, posts: 2, fame: 0.15, noAvatar: true, noCover: true },
  { username: 'anouk', name: 'Anouk Peeters', bio: 'Analog collage. Scissors, glue, 1970s travel magazines.', location: 'Antwerp', links: ['anoukpeeters.example.com'], cat: 1, posts: 5, fame: 0.5, collab: true },
  { username: 'idris', name: 'Idris Bello', bio: 'Sound artist. Modular synths, field recordings, tape hiss.', location: 'Abuja', links: ['idrisbello.example.com'], cat: 1, posts: 3, fame: 0.3, collab: true, noAvatar: true },
  { username: 'nell', name: 'Nell Whitaker', bio: 'Drawing a graphic novel very slowly.', location: 'Leeds', links: [], cat: 1, posts: 2, fame: 0.25, noAvatar: true, noCover: true },
]

const linkOf = site => ({ url: `https://${site}`, text: site })

// The stored user record for one of the people above
const toUser = (person, id) => ({
  id: String(id), username: person.username, name: person.name, bio: person.bio, location: person.location,
  email: `${person.username}@example.com`, links: person.links.map(linkOf), hasCover: !person.noCover,
  ...(person.noAvatar ? { noAvatar: true } : {}),
  ...(person.hire !== undefined ? { hireable: !!person.hire } : {}),
  ...(person.collab !== undefined ? { collaborateable: !!person.collab } : {}),
})

const personOf = username => PEOPLE.find(p => p.username === username)

module.exports = { PEOPLE, toUser, personOf, linkOf }
