# Flashcards

Make single-sided flashcards from word lists.

Reads a text-file and treats each line as the text for a single card. Multiple words on one card are
current wrapped two words per line on the card.

## Usage

You should have at least Node version 20 installed. See [the Node website](https://nodejs.org/en) for instructions on installing Node.

You also should be familiar with running command on the command line.

First, install the Node packages. You can do this by running:

```bash
npm install
```

Or if you have `yarn` installed (better), you can run:

```bash
yarn
```

After the packages are installed, you can then run:

```bash
npx tsx makecards.ts Words.txt label
```

...where Words.txt is the name of the text file you want to convert into flashcards, and "label" is a label you would
like to place in the top right corner of each card.

## About

This is a zero-frills tool that I created for a very specific use, and it worked exactly well enough
for that use. If anyone wants to send PRs that improve it, as long as it still works and the code isn't
too terrible, I'll likely just approve the PRs.

It's not particularly fancy code. In fact, if I were to do it again, I would probably get rid of Sharp and just use pdf-lib to draw text directly onto the PDF. If anyone wants to submit a PR to that effect? Please do! PRs are welcome.

I wouldn't have even bothered pushing this to Github if a teacher hadn't requested it. So enjoy!
