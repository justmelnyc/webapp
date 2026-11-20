/* eslint-disable */
// Captions anyone could have written, whatever their medium. `{m}` becomes a mention of someone they follow.
const GENERAL = [
  'WIP. Not sure about the left side yet.',
  'Finished. I think. Do not let me touch it again.',
  'Studio today.',
  'Before and after. Three weeks between these two pictures.',
  'Old one I found on a hard drive. I was braver in 2019.',
  'Detail.',
  'This one fought me the whole way.',
  'Trying something new. Tell me if it is working, I have lost all perspective.',
  'Made this for myself. No client, no brief, no deadline. Strange feeling.',
  'Number four in the series. The first three are further down my page.',
  'Day 12 of making one thing a day. I skipped day 9 and I am not sorry.',
  'Desk situation.',
  'I have looked at this for so long that it has stopped being a picture.',
  'Leftovers from a job that fell through. Better here than in a folder.',
  'Morning pages.',
  'The version I showed the client vs. the version I wanted to show the client.',
  'Small one.',
  'Finally photographed this properly.',
  'Process shots, since a few of you asked.',
  'Started as a warm-up, ate the whole day.',
  'Scrapped everything from last week. Feels great, honestly.',
  'Colour study.',
  'Does this read as finished or abandoned? Asking seriously.',
  'From the sketchbook.',
  'Failed attempt, posting it anyway.',
  'It is done when the deadline says it is done.',
  'Tiny update on the big thing.',
  'Borrowed a friend\'s studio for the week. The light in here is unfair.',
  'First thing I have liked in a month.',
  'Not for sale, not for anything. Just wanted to make it.',
  'Second pass. Quieter than the first.',
  'Up at five for this. Worth it, barely.',
  'Tools of the week.',
  'The wall above my desk, updated.',
  'Rejected. Posting it out of spite.',
  'One more from yesterday.',
  'Packing orders all day. If you bought something this week, it is on its way.',
  'Open studio on Saturday, 12 to 6. There will be biscuits.',
  'Slow week. This is all of it.',
  'I keep coming back to this shape.',
  'Unplanned.',
  'Late one.',
  'Reworked an old piece. I can not tell if I fixed it or just made it newer.',
  'Framed and on a wall that is not mine. Odd to visit your own work.',
  'Two hours in. Stopping here before I ruin it.',
  'Proof arrived. The red is wrong, everything else is right.',
  'Notes to self, apparently in public.',
  'Same subject as last week, different mood.',
  'I said I would post more unfinished things. Here is an unfinished thing.',
  'Back at it after two weeks away. Hands forgot everything.',
]

const WITH_MENTION = [
  'Made after a long conversation with @{m} about why we bother. We bother.',
  'For @{m}, who asked to see the whole thing.',
  '@{m} talked me out of throwing this away. Blame them.',
  'Swapped work with @{m} this week. I got the better deal.',
  'Stole this colour combination from @{m} and I will do it again.',
  'Studio visit from @{m} today. We got nothing done.',
  'Thanks @{m} for the paper recommendation, it changed everything.',
  '@{m} is this what you meant?',
  'Collab with @{m}, part one. They did the hard half.',
  'Seen at the opening last night, with @{m} hiding behind the plinth.',
]

// Questions and rants: text only, no picture
const TEXT_ONLY = [
  'How do you all price commissions? I either undercharge or scare people off, there is no middle.',
  'Reminder that it is fine to make a bad thing today.',
  'Does anyone have a framer they trust who will not ask what it is supposed to be?',
  'I am closing commissions until March. Thank you for being patient with me.',
  'Three people this week asked if I could do it "for exposure". I can not pay rent in exposure.',
  'Looking for a studio share from January. North side, natural light, I am quiet and I bring cake.',
  'What are you listening to while you work? I have worn out my one playlist.',
  'Unpopular opinion: the sketch was better. The sketch is always better.',
  'Printer recommendations for a run of 100? Small, careful, somewhere they still answer the phone.',
  'Took a whole week off screens. Made more than I have in months. Annoying.',
  'If you emailed me in October: I am sorry. I am getting to it.',
  'Is it normal to hate everything you made last year? Asking for me.',
  'Shipping prices went up again. I am absorbing it this time, but something has to change by spring.',
  'Small win: someone hung my print in their kitchen and sent a photo.',
  'I miss when we all just posted work and did not think about reach.',
  'Anyone going to the print fair next month? I have half a table and nobody to watch it at lunch.',
  'Good morning to everyone except the person who invented the artist statement.',
  'Tell me a tool you bought this year that was actually worth it.',
  'New work soon. I say this to make it true.',
  'The exhibition is confirmed. I can say that now. More when I am allowed.',
]

// Long posts: each entry is a list of paragraphs
const LONG = [
  [
    'A few people asked how the last piece was made, so here is the honest version.',
    'I started in September with a completely different idea. For three weeks I made studies that all looked like other people\'s work. I liked none of them, and I could not say why, which is the worst kind of not liking.',
    'What changed it was running out of the good paper. I had to use the back of old proofs, and because they were already ruined I stopped being careful. The first loose one took twenty minutes and it was better than everything from the month before.',
    'So that is the method, I suppose: get tired, run out of materials, stop protecting the work. I would not recommend it and I will do it again.',
  ],
  [
    'I have been here a year this week.',
    'When I joined I had made nothing in a long time and was mostly looking. I followed about ten of you and decided to post one thing, badly photographed, on a Tuesday night. Four people said something kind and one asked a real question about it.',
    'I think about that question more than any review I have had. Thank you for looking properly. It is rarer than it should be.',
  ],
  [
    'On saying no.',
    'I turned down a job last month. Good money, a name you would recognise, a deadline that would have eaten December. A year ago I would have said yes before I finished reading the email.',
    'I do not have a lesson here. The rent is still the rent. But I spent December on my own work for the first time in four years, and some of it is good, and all of it is mine.',
  ],
  [
    'Notes from the workshop I taught on Saturday, mostly so I do not forget them.',
    'Nobody needs more equipment. Three people apologised for their tools before they had made a single mark. By the end of the day the best work in the room came from a biro and the back of the handout.',
    'Everyone is afraid of the first mark and nobody is afraid of the tenth. So make nine quickly.',
    'People will show you the thing they are proud of last, after the things they think you want to see. Wait for it.',
  ],
  [
    'Studio move, week two.',
    'Everything I own is in forty boxes labelled MISC. The new room is smaller and colder and has a window, which the old one did not, so I keep stopping to look at weather.',
    'No new work for a little while. I am building shelves and finding things I made in 2016 that I had decided were lost. Some of them should have stayed lost.',
  ],
  [
    'Someone asked what I would tell myself at the start.',
    'Keep the bad ones. Not to show, just to keep. You will want to know how far it was.',
    'Write down what you mixed. You will not remember. You never remember.',
    'And finish things. A finished mediocre thing teaches you more than a brilliant third of a thing. I have drawers full of brilliant thirds.',
  ],
]

// Captions for posts that end in a link (image + text + link)
const WITH_LINK = [
  'Wrote up the whole process, with all the mistakes left in:',
  'Prints of this one are up, edition of 30:',
  'The full set lives here:',
  'Interview went up today. I say "sort of" eleven times:',
  'New page on the site, with the ones that did not fit here:',
  'Open call I think some of you should enter (deadline is the 30th):',
  'Sign-up for the next workshop is open, eight places:',
  'Longer text about this series, for the patient:',
]

// Captions for something to listen to or watch
const WITH_EMBED = [
  'This has been on in the studio all week.',
  'Watched this three times in a row. The edit at the two minute mark!',
  'A short film about someone who does one thing very well. Twenty minutes, worth it.',
  'Made the sound for this. Headphones if you have them.',
  'Sunday listening.',
  'If you need something to draw to.',
]

// Captions for work that is for sale (the images carry the buy link)
const FOR_SALE = [
  'Last five of the edition. When they are gone they are gone.',
  'Small originals, all under 60. Shipping from Thursday.',
  'Restocked after far too long.',
  'Seconds sale: tiny flaws, half price, no returns, lots of love.',
  'Edition of 20, signed and numbered on the back.',
  'Made a few extra from the last batch.',
]

module.exports = { GENERAL, WITH_MENTION, TEXT_ONLY, LONG, WITH_LINK, WITH_EMBED, FOR_SALE }
