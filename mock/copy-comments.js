/* eslint-disable */
// What people say under each other's work, and the notes they add to a repost.
const COMMENTS = [
  'This is gorgeous.',
  'The colours in this!',
  'How long did this take you?',
  'Oh I love this one.',
  'The composition is doing a lot of quiet work here.',
  'Wow.',
  'This made my morning.',
  'Stunning. What paper is that?',
  'I keep coming back to look at this.',
  'The texture! I want to touch my screen.',
  'So good.',
  'Is this for sale? Asking for my wall.',
  'I can not stop looking at the bottom left corner.',
  'You make it look easy and I know it is not.',
  'This is the best one yet.',
  'Saving this for a bad day.',
  'What did you use for the darks?',
  'That light.',
  'I would hang this in a heartbeat.',
  'There is so much air in this, I love it.',
  'Please tell me there will be prints.',
  'This feels like a memory I do not have.',
  'Okay, this one got me.',
  'The restraint! I would have overworked it in ten minutes.',
  'More of these, please.',
  'Beautiful work as always.',
  'Did you plan the crop or find it afterwards?',
  'I showed this to my studio mate and we both just went quiet.',
  'Teach a workshop. I will pay actual money.',
  'How big is the original?',
  'Really strong.',
  'The edges are so considered.',
  'This is exactly the kind of thing I joined for.',
  'I have the same problem with that kind of blue. You solved it.',
  'Love seeing the process.',
  'Ha, the caption. Same here.',
  'Screens do not do this justice, I bet.',
  'I needed to see this today.',
  'Something about the scale really works.',
  'Yes yes yes.',
  'Quietly brilliant.',
  'The patience this must take.',
  'I can hear this picture.',
  'This is so you. In the best way.',
  'First one of yours I have seen, following now.',
  'What a find.',
  'I think it is finished. Step away from it!',
  'The left side is working, for what it is worth.',
  'Unreal.',
  'That is a lot of hours. It shows.',
  'This would make a great cover.',
  'Never delete this.',
  'Honestly jealous.',
  'It looks effortless, which means it was not.',
  'The longer I look, the more there is.',
  'Bookmarking for reference, hope that is okay.',
]

// Short reactions, mostly emoji
const REACTIONS = ['🔥', '😍', '👏👏👏', '🙌', 'Oof. 🔥', '❤️', '✨✨', 'YES 🙌', '👀', '🖤', 'This!! 😭', '💯']

// Questions that open with a mention of the author (rendered as a link)
const TO_AUTHOR = [
  'which lab do you use for scans?',
  'are you bringing these to the fair?',
  'would you ever sell the studies?',
  'what size is this? I can not tell and I want it to be huge.',
  'is the series finished or is there more coming?',
  'I sent you a message about a trade, no rush.',
  'how do you photograph your work? Mine always looks grey.',
]

// What the author answers in their own thread
const REPLIES = [
  'Thank you!',
  'Thanks, that means a lot.',
  'Ah thank you. It nearly went in the bin.',
  'About two weeks, on and off.',
  'Prints soon, I promise.',
  'It is small! A5, roughly.',
  'Thank you all, truly.',
  'Found it afterwards, like most good things.',
  'Too kind.',
  'Yes, a few are for sale. Message me.',
  'Cheap paper, expensive patience.',
  'This is going on the studio wall, thank you.',
]

// Comments that come with a picture
const WITH_PICTURE = [
  'Reminded me of this one from last year.',
  'Mine from the same spot, for comparison.',
  'It is on my wall now! Look.',
  'Had to show you what it inspired.',
]

// What a reposter adds on top (an empty string is a bare repost). The first five are the original seed notes.
const REPOST_NOTES = [
  'Needed to share this one.',
  '',
  'Look at that light.',
  '',
  'Saving this for later. So good.',
  'Everyone should see this.',
  '',
  'One of my favourite people on here.',
  'This has been stuck in my head for days.',
  '',
  'If you are not following them yet, fix that.',
  '',
  'The whole series is worth your time.',
  'I wish I had made this.',
  '',
  'Reposting because the first time I saw it I forgot to breathe.',
]

module.exports = { COMMENTS, REACTIONS, TO_AUTHOR, REPLIES, WITH_PICTURE, REPOST_NOTES }
