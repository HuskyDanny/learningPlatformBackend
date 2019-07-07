const { Router } = require("express");
var FroalaEditor = require("wysiwyg-editor-node-sdk");
const auth = require("../../auth");

router = Router();

app.get("/load_images", auth.required, function(req, res) {
  FroalaEditor.Image.list("/uploads/", function(err, data) {
    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }
    console.log("loading");
    return res.send(data);
  });
});

router.post("/images", auth.required, async (req, res) => {
  FroalaEditor.Image.upload(req, "/uploads/", function(err, data) {
    if (err) {
      return res.send(JSON.stringify(err));
    }
    res.send(data);
  });
});

router.post("/delete_image", auth.required, function(req, res) {
  //Here delete us fs.unlink which use the pathname of current folder
  //Be careful of the src sent from client
  FroalaEditor.Image.delete(req.body.src, function(err) {
    if (err) {
      console.log(err);
      return res.status(404).end(JSON.stringify(err));
    }
    return res.end();
  });
});

module.exports = router;
