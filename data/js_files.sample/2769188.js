var tutorial = Tutorial({
    controls: "#player",
    editor: "#editor",
    preview: "#preview",
    instructions: "#dialogue"
  })
  .instruct("Hi! I am Mr. Love Bomb and will teach you how to be a webmaker now.", 0)
  .typechars("you're really cool.")
  .instruct("Check it out, this is HTML source code&mdash;the language of the Web.", 0)
  .spotlight("#editor")
  .instruct("And this is what the HTML looks like on the Web.", 0)
  .spotlight("#preview")
  .instruct("The two look pretty similar right now, don't they?")
  .instruct("But in HTML, you can use <em>tags</em> to structure and format your Web page. Check this out!")
  .moveto({position: "beginning", search: "really"})
  .typechars("<em>")
  .moveto({position: "end", search: "really"})
  .typechars("</em>")
  .instruct("We call that an <code>&lt;em&gt;</code> tag. The <em>em</em> stands for <em>emphasis</em>.")
  .instruct("Notice how the text we want to emphasize is now in italics.", 0)
  .spotlight("#preview")
  .instruct("Now it's your turn. Can you make the word <em>you're</em> italicized instead of <em>really</em>?", 0)
  .codechallenge({
    test: function hasUserItalicizedWord(editor) {
      var value = editor.getValue();
      return (value.match(/\<em\>\s*you're\s*\<\/em\>\s*really cool\./i));
    },
    win: "div.win"
  })
  .end();
