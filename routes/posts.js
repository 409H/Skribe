var express = require('express');
var passport = require('passport');
var markdown = require('markdown').markdown;
var fs = require('fs');

var router = express.Router();
var Post = require('../models/post.js');

function authCheck(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

// render the edit form
router.get('/:post/edit', authCheck, function(req, res) {
  Post.findById(req.params.post).populate('user').exec(function(err, result) {
    if(err) return console.error(err);

    if(result.user._id == req.user._id) {
      res.render('new', {
        post: result,
        formAction: '/p/' + result._id + '/edit',
        title: 'Editing: ' + result.title + ' | Scribe'
      });
    } else {
      res.render('403', { subtitle: "You do not have permission to edits this document", p: "This document is owned by another user, if you know who owns this and you wish to have it removed then please contact them. If this violates any laws then please contact us at Scribe." }, 403);
    }
  });
});

// handle the edit form
router.post('/:post/edit', authCheck, function(req, res) {
  Post.findById(req.params.post).populate('user').exec(function(err, result) {
    if(err) return console.error(err);

    // only if it is the users document
    if(result.user._id == req.user._id) {
      // get the first line
      var title = req.body.content.split('\n');
      // store the updated data
      result.title = title[0];
      result.body = req.body.content;
      result.private = req.body.private;
      result.save(function(err, result) {
        if(err) return console.error(err);
        // flash and redirect back to the edit page
        req.flash('info', 'Document updated');
        res.redirect('/p/' + result._id + '/edit');
      });
    } else {
      // this is not the user's document so render an error page
      res.render('403', {
        subtitle: "You do not have permission to edit this document",
        ps: [
          "This document is owned by another user, if you know who owns this and you wish to have it removed then please contact them.",
          "If this document violates any laws or our terms then please contact us at Scribe."
        ]
      });
    }

  });
});

// delete the document
router.get('/:post/delete', function(req, res) {
  Post.findById(req.params.post).populate('user').exec(function(err, result) {
    if(err) return console.error(err);

    if(result.user._id == req.user._id) {
      // attempt to remove the document
      var query = Post.remove({ _id: result._id });
          query.exec();
      // notify and show homepage
      req.flash('info', 'Document deleted');
      res.redirect('/');
    } else {
      // this is not the user's document so render an error page
      res.render('403', {
        subtitle: "You do not have permission to delete this document",
        ps: [
          "This document is owned by another user, if you know who owns this and you wish to have it removed then please contact them.",
          "If this document violates any laws or our terms then please contact us at Scribe."
        ]
      });
    }
  });
});

// download a generated PDF file
router.get('/:post/download', function(req, res) {
  Post.findById(req.params.post).populate('user').exec(function(err, result) {
    if(err) return console.error(err);
    if(!result) return res.render('404', {
      subtitle: 'Document does not exist',
      ps: [
        "This document does not exist, check your sources and try again"
      ]
    });

    var markdownpdf = require('markdown-pdf');
    var mdoutput = result.body + '\n\n\n\n Created with *Skribe.it*';
    var filename = 'tmp/'+ result._id +'.pdf';

    markdownpdf({
      renderDelay: 2000,
      cssPath: '/home/callumb/webapps/skribe/app/public/stylesheets/base.css',
      paperBorder: '0.75in'
    })
    .from.string(mdoutput)
    .to(filename, function() {

      // tell the browser to download the file
      res.setHeader('Content-disposition', 'attachment; filename=' + result.title + ' - Skribe.it.pdf');
      res.setHeader('Content-type', 'application/pdf');

      // setup the stream and pipe it
      var stream = fs.createReadStream(filename, {bufferSize: 64 * 1024});
      stream.pipe(res);

      // handle errors
      var had_error = false;
      stream.on('error', function(err){
        had_error = true;
      });
      // remove from tmp
      stream.on('close', function(){
        if (!had_error) fs.unlink(filename);
      });

    });

  });
});

// render the document
router.get('/:post', function(req, res) {
  Post.findOne({ _id: req.params.post }).populate('user').exec(function(err, result) {
    if(err) return console.error(err);
    if(!result) return res.render('404', {
      subtitle: 'Document does not exist',
      ps: [
        "This document does not exist, check your sources and try again"
      ]
    });

    console.log(result);
    res.render('detail', { post: result, md: markdown.toHTML(result.body) });
  });
});


module.exports = router;
