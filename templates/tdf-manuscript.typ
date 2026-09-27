// ============================================================================
//  Transactions on Decarbonization Frontiers (TDF)
//  Manuscript template — Typst
// ----------------------------------------------------------------------------
//  Typst needs no installation. Open https://typst.app, paste this in, and
//  export a PDF. Take the free account; it is enough.
//
//  Submit the PDF at:  https://yangran12.github.io/YRpublish/submit.html
//
//  Before you submit, check:
//    [ ] Title, all authors, all affiliations — complete and correctly ordered
//    [ ] Abstract is 150-250 words
//    [ ] 3-6 keywords
//    [ ] Every figure and table is numbered, captioned and referred to in text
//    [ ] References are complete and in a consistent style
//    [ ] The work is not under consideration elsewhere
//    [ ] All authors have agreed to submission and to open review
// ============================================================================

#set page(paper: "a4", margin: 2.5cm, numbering: "1")
#set text(size: 11pt, font: ("New Computer Modern", "Times New Roman"))
#set par(justify: true, leading: 0.72em)
#set heading(numbering: "1.")
#show heading.where(level: 1): it => block(above: 1.4em, below: 0.7em)[
  #set text(size: 13pt)
  #it
]

// ----------------------------------------------------------------- title block
#align(center)[
  #text(size: 17pt, weight: "bold")[Your Manuscript Title Goes Here]
]

#v(0.9em)

#align(center)[
  First Author#super[1], Second Author#super[1], Third Author#super[2] \
  #v(0.35em)
  #text(size: 9pt)[
    #super[1] School of Electrical and Automation Engineering,#linebreak()
    Nanjing Normal University, Nanjing 210023, China#linebreak()
    #super[2] Department, Institution, City, Country
  ]
  #v(0.5em)
  #text(size: 9pt)[Corresponding author: #link("mailto:you@example.com")[you\@example.com]]
]

#v(0.6em)
#line(length: 100%, stroke: 0.5pt)
#v(0.6em)

#align(center)[#text(size: 11pt, weight: "bold")[Abstract]]
#v(0.3em)

#pad(x: 2em)[
  Write your abstract here, 150 to 250 words. State the problem, the method,
  the main quantitative result, and why it matters. Avoid citations, undefined
  abbreviations and forward references to figures.
]

#v(0.7em)
#noindent #text(weight: "bold")[Keywords:] electric vehicles; smart grid; low-carbon dispatch
#v(0.4em)
#line(length: 100%, stroke: 0.5pt)

// --------------------------------------------------------------- main text
= Introduction

Explain the problem and why it matters. Say what has been done before and what
is still missing. End with a short statement of what this paper contributes ---
two or three sentences is enough, no more.

= Method

Describe the method in enough detail that a reader could reproduce it without
contacting you. Define every symbol the first time it appears.

$ min_P sum_(t=1)^T ( c_t^"grid" P_t^"grid" + c^"deg" |P_t^"ess"| ) $ <objective>

Refer back to Eq. @objective when you discuss it.

= Case study

Say what system you tested on, where the data came from, and what you assumed.
If you used a public dataset, cite it.

#figure(
  table(
    columns: (auto, auto, auto),
    align: (left, right, right),
    stroke: 0.4pt,
    [*Scenario*], [*Cost (CNY)*], [*Emissions (tCO₂)*],
    [Baseline], [100 000], [42.1],
    [With EV scheduling], [91 400], [36.8],
  ),
  caption: [Headline results. Replace with your own numbers.],
) <results>

Refer to it as @results. Every figure and table needs a reference like this in
the running text.

= Discussion

State the limitations honestly. What would change your conclusion? What did you
not test? A reviewer will ask, so answer it first.

= Conclusion

Two or three paragraphs at most. What did you show, and what follows from it.
Do not introduce new results here.

= Acknowledgements <ack>

Optional. Funding sources, data providers, people who helped but are not authors.

// ---------------------------------------------------------------- references
#line(length: 100%, stroke: 0.5pt)
#heading(numbering: none)[References]

#set par(leading: 0.6em)
#text(size: 10pt)[
  [1] A. Author and B. Author, "Title of the cited paper," _Journal Name_,
      vol. 12, no. 3, pp. 45--67, 2026.

  [2] C. Author, _Title of the Book_. City: Publisher, 2025, ch. 4.

  [3] D. Author, "Title of the conference paper," in _Proc. Conference Name_,
      2026, pp. 1--6.
]
