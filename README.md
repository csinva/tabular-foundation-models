# Tabular foundation models

A talk on tabular foundation models: how TabPFN v2 works, what later models changed, and where the field stood in October 2026.

## Controls

- Next / previous slide: arrow keys, Space, or click the right / left half of the screen
- All slides: Esc, then click a slide or use the arrow keys and Enter
- First / last slide: Home / End
- Full screen: F

## Rebuilding

`index.html` is generated and self-contained. To change the deck, edit the files in `src/` and run:

```
python3 src/build.py
```

- `src/slides/`: one HTML file per slide, with speaker notes in each `<aside>`
- `src/deck.json`: slide order
- `src/viz_head.js`, `src/viz_body.js`: the diagrams and the prior animation

The accuracy vs inference time figure on the TabArena slide is from NVIDIA's [Kumo Tabular post](https://huggingface.co/blog/nvidia/kumo-tabular).
