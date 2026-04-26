import "dotenv/config"
import { v2 as cloudinary } from "cloudinary"
import { readdirSync } from "fs"

cloudinary.config({
  cloud_name: "dwnfccsje",
  api_key: "496952356133331",
  api_secret: "1kYnrqjzQf16C-J0altYjjlqoK0",
})

const TMP = "/tmp/auto-replace-mod4-lesson8"
const slides = readdirSync(TMP).filter((f) => f.endsWith(".png")).sort()

async function main() {
  for (let i = 0; i < slides.length; i++) {
    const publicId = `jvr-brand-scaling/hires/mod4-lesson8/slide-${i + 1}`
    const path = `${TMP}/${slides[i]}`
    console.log(`Uploading slide ${i + 1}/${slides.length}...`)
    await cloudinary.uploader.upload(path, {
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
      format: "png",
    })
  }
  console.log("All done!")
}
main().catch(console.error)
