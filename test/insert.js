document.addEventListener('DOMContentLoaded', function() {

  QUnit.module("ice core | InlineChangeEditor.insert", function() {

    QUnit.test("inserting into a block (paragraph in this case)", function(assert) {
      // Setup for inserting into a block (paragraph in this case).
      var el = createEl('<div>' +
          '<p>a paragraph</p>' +
        '</div>');
      var changeEditor = getIce(el);
      document.body.appendChild(el);
      var range = changeEditor.env.selection.createRange();

      // Insert at the end of a paragraph.
      range.setStart(el.querySelectorAll('p')[0], 0);
      range.moveStart('character', 11);
      range.collapse(true);
      changeEditor.insert('. The end.', range);
      assert.ok(el.querySelectorAll('.ins')[0].textContent === '. The end.'
            && el.textContent === 'a paragraph. The end.',
          'Inserted at the end of a block.');

      // Insert at the middle of the paragraph.
      range.setStart(el.querySelectorAll('p')[0], 0);
      range.moveStart('character', 2);
      range.collapse(true);
      changeEditor.insert('new ', range);
      assert.ok(el.querySelectorAll('.ins')[0].textContent === 'new '
            && el.textContent === 'a new paragraph. The end.',
          'Inserted in the middle of a block.');

      // Insert at the beginning of the paragraph.
      range.setStart(el.querySelectorAll('p')[0], 0);
      range.collapse(true);
      changeEditor.insert('At the beginning of ', range);
      assert.ok(el.querySelectorAll('.ins')[0].textContent === 'At the beginning of '
            && el.textContent === 'At the beginning of a new paragraph. The end.',
          'Inserted at the beginning of a block.');
    });

    QUnit.test("nested inserts", function(assert) {
      // Setup for nested inserts.
      var el = createEl('<div>' +
          '<p>test<span class="ins cts-1" userid="2" cid="1" data-username="hank"> in 1 <span class="ins cts-2" userid="3" cid="2" data-username="eve">in 2 </span></span><span class="ins cts-3" userid="4" cid="3" data-username="James">in 3</span> done.</p>' +
        '</div>');
      var changeEditor = getIce(el);
      document.body.appendChild(el);
      var range = changeEditor.env.selection.createRange();

      // Insert into same user insert.
      range.setStart(el.querySelectorAll('span[cid="3"]')[0], 0);
      range.moveStart('character', 2);
      range.collapse(true);
      changeEditor.insert('sert', range);
      assert.ok(el.querySelectorAll('[cid="3"]')[0].textContent === 'insert 3'
            && el.textContent === 'test in 1 in 2 insert 3 done.',
          'Inserted in same user insert.');

      // Insert into another user's insert.
      range.setStart(el.querySelectorAll('span[cid="1"]')[0], 0);
      range.moveStart('character', 3);
      range.collapse(true);
      changeEditor.insert('sert', range);
      assert.ok(el.textContent === 'test insert 1 in 2 insert 3 done.', 'Inserted in another user insert.');

      // Insert into nested, multi-user insert.
      range.setStart(el.querySelectorAll('span[cid="2"]')[0], 0);
      range.moveStart('character', 2);
      range.collapse(true);
      changeEditor.insert('sert', range);
      assert.ok(el.querySelectorAll('[cid="2"]')[0].querySelector('.ins').textContent === 'sert'
            && el.textContent === 'test insert 1 insert 2 insert 3 done.',
          'Inserted in a mult-user insert.');
    });

    QUnit.test("inserting in deletes.", function(assert) {
      // Setup for inserting in deletes.
      var el = createEl('<div>' +
          '<p>test <span class="del cts-1" userid="1" cid="1" data-username="hank">delete 1</span><span class="del cts-2" userid="2" cid="2" data-username="eve"> delete 2<span class="del cts-3" userid="3" cid="3" data-username="james"> delete 3</span> delete 2.</span> The end.</p>' +
        '</div>');
      var changeEditor = getIce(el);
      document.body.appendChild(el);

      var range = changeEditor.env.selection.createRange();
      // Try to insert in a delete
      range.setStartAfter(el.querySelectorAll('span[cid="3"]')[0], 0);
      range.collapse(true);
      changeEditor.insert(' new insert.', range);
      assert.ok(el.querySelector('.ins').textContent === ' new insert.'
            && el.textContent === 'test delete 1 delete 2 delete 3 delete 2. new insert. The end.',
          'Tried to insert in a delete.');
      var insNodes = el.querySelectorAll('.ins');
      for (var i = 0; i < insNodes.length; i++) insNodes[i].parentNode.removeChild(insNodes[i]);

      // Try to insert in a nested delete
      range.setStart(el.querySelectorAll('span[cid="3"]')[0], 0);
      range.collapse(true);
      changeEditor.insert(' new insert.', range);
      assert.ok(el.querySelector('.ins').textContent === ' new insert.'
            && el.textContent === 'test delete 1 delete 2 delete 3 delete 2. new insert. The end.',
          'Tried to insert in a nested delete.');
      insNodes = el.querySelectorAll('.ins');
      for (var i = 0; i < insNodes.length; i++) insNodes[i].parentNode.removeChild(insNodes[i]);

      // Try to insert in a delete that has an adjacent delete
      range.setStart(el.querySelectorAll('span[cid="1"]')[0], 0);
      range.moveStart('character', 1);
      range.collapse(true);
      changeEditor.insert(' new insert.', range);
      assert.ok(el.querySelector('.ins').textContent === ' new insert.'
            && el.textContent === 'test delete 1 delete 2 delete 3 delete 2. new insert. The end.',
          'Tried to insert in a delete that has an adjacent delete.');
    });

    QUnit.test("inserting into a block containing one delete", function(assert) {
      // Setup for inserting into a block containing one delete.
      var el = createEl('<div>' +
          '<p><span class="del cts-1" userid="1" cid="1" data-username="hank">delete</span></p><p> text</p>' +
        '</div>');
      var changeEditor = getIce(el);
      document.body.appendChild(el);

      var range = changeEditor.env.selection.createRange();
      // Try to insert in a delete consuming whole paragraph
      range.setStart(el.querySelectorAll('p')[0], 0);
      range.moveStart('character', 1);
      range.collapse(true);
      changeEditor.insert(' test', range);
      assert.ok(el.textContent === 'delete test text'
          && el.querySelector('.ins').parentNode.matches('p'),
        'Tried to insert in a delete that consumes the inside of a block.');
    });

    QUnit.test("inserting into a block containing one delete and no other blocks", function(assert) {
      // Setup for inserting into a block containing one delete and no other blocks.
      var el = createEl('<div>' +
          '<p><span class="del cts-1" userid="1" cid="1" data-username="hank">del</span><span class="del cts-2" userid="1" cid="2" data-username="eve">ete</span></p>' +
        '</div>');

      var changeEditor = getIce(el);
      document.body.appendChild(el);

      var range = changeEditor.env.selection.createRange();
      // Try to insert in a delete consuming paragraph and no other blocks
      range.setStart(el.querySelectorAll('p')[0], 0);
      range.moveStart('character', 1);
      range.collapse(true);
      changeEditor.insert(' test', range);
      assert.ok(el.textContent === 'delete test'
          && el.querySelector('.ins').parentNode.matches('p'),
        'Tried to insert in a delete that consumes the inside of a block with no following blocks.');
    });

    QUnit.test("inserting a space into a .del region", function(assert) {
      // Setup for inserting a space into a .del region.
      var el = createEl('<div>' +
          '<p>The placid sliver of <span class="del cts-3" data-cid="4" data-userid="11">Long</span> Island that F. Scott Fitzgerald immortalized in "The Great Gatsby" as West Egg and East Egg seems almost to have shrugged off the recession.</p>' +
          '</div>');
      var changeEditor = getIce(el);
      document.body.appendChild(el);

      var range = changeEditor.env.selection.createRange();

      range.setStart(el.querySelector('span.del'), 1);
      range.collapse(true);
      changeEditor.insert(" ", range);
      assert.ok(el.querySelector(".del").textContent === "Long"
          && el.querySelectorAll(".ins").length === 1
          && el.querySelector(".ins").textContent === " ",
          "Pressed spacebar from inside delete region.");


      // Setup for inserting a space into a .del region, with track changes hidden.
      var el2 = createEl('<div>' +
          '<p>The placid sliver of <span class="del cts-3" data-cid="4" data-userid="11">Long</span> Island that F. Scott Fitzgerald immortalized in "The Great Gatsby" as West Egg and East Egg seems almost to have shrugged off the recession.</p>' +
          '</div>');
      changeEditor = getIce(el2);
      document.body.appendChild(el2);
      el2.querySelector(".del").style.display = "none";

      range.setStart(el2.querySelector('span.del'), 1);
      range.collapse(true);
      changeEditor.insert(" ", range);
      assert.ok(el2.querySelector(".del").textContent === "Long"
          && el2.querySelectorAll(".ins").length === 1
          && el2.querySelector(".ins").textContent === " ",
          "Pressed spacebar from inside delete region.");
    });
  });
});
