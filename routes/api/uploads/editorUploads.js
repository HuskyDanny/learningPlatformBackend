const { Router } = require("express");
var FroalaEditor = require("wysiwyg-editor-node-sdk");
const auth = require("../../auth");
const fs = require("fs");
const path = require("path");
const s3 = require("../../../config/aws");

//Initiate router
router = Router();

app.get("/load_images", auth.required, function(req, res) {
  FroalaEditor.Image.list("/uploads/", function(err, data) {
    if (err) {
      return res.status(404).end(JSON.stringify(err));
    }

    return res.send(data);
  });
});

router.post("/images", auth.required, async (req, res) => {
  FroalaEditor.Image.upload(req, "/uploads/", function(err, data) {
    if (err) {
      return res.send(JSON.stringify(err));
    }

    const filePath = path.join(
      path.dirname(require.main.filename),
      data["link"]
    );
    var params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Body: fs.createReadStream(filePath),
      Key: "folder/" + Date.now() + "_" + path.basename(filePath)
    };
    s3.upload(params, function(err, data) {
      //handle error
      if (err) {
        console.log("Error", err);
        return res.json(err);
      }

      //success
      if (data) {
        console.log("Uploaded in:", data.Location);

        return res.json(data);
      }
    });
  });
});

router.delete("/delete_image", auth.required, function(req, res) {
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
