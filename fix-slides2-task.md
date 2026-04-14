Fix the slide viewer. Google Docs viewer fails with Cloudinary raw URLs. 

## Solution: Re-upload PDFs as Cloudinary images and use Cloudinary's built-in PDF-to-image conversion

Cloudinary can convert PDF pages to images automatically. When you upload a PDF with resource_type: "image", Cloudinary converts each page to an image accessible via URL with page parameter.

## Step 1: Write a script to re-upload the PDFs

Create scripts/reupload-slides.mjs that:
1. Uploads each PDF with resource_type: "image" (not "raw") to Cloudinary folder jvr-brand-scaling/slides-img/
2. Cloudinary will auto-convert to images
3. The base URL will be like: https://res.cloudinary.com/dwnfccsje/image/upload/jvr-brand-scaling/slides-img/lesson-1
4. Each page is accessed as: https://res.cloudinary.com/dwnfccsje/image/upload/pg_1/jvr-brand-scaling/slides-img/lesson-1.jpg

The PDF files are at:
- /tmp/slides-pdf/Lesson_1.1_What_Brand_Scaling_Actually_Is_v2---*.pdf
- /tmp/slides-pdf/Lesson_1.2_Why_Brands_Need_This_v2---*.pdf  
- /tmp/slides-pdf/Lesson_1.3_What_You_Are_Actually_Selling---*.pdf
- /tmp/slides-pdf/Lesson_1.4_What_Your_Role_Is_and_What_It_Is_Not---*.pdf
- /tmp/slides-pdf/Lesson_1.5_The_Opportunity_in_This_Business_Model---*.pdf

Upload them with:
```js
cloudinary.uploader.upload(filePath, {
  resource_type: "image",
  folder: "jvr-brand-scaling/slides-img",
  public_id: `lesson-${i}`,
  overwrite: true,
  format: "jpg",
})
```

Print the base URL for each.

## Step 2: Update the CourseView slide viewer

Instead of an iframe, create a SlideViewer component that:
- Fetches the number of pages by checking Cloudinary image info (or just try loading pages 1-50 and stop when 404)
- Better approach: use a simple image carousel/slideshow
- Shows page 1 by default: `https://res.cloudinary.com/dwnfccsje/image/upload/pg_1/jvr-brand-scaling/slides-img/lesson-1.jpg`
- Has Previous/Next buttons
- Shows current page number "Slide 1 of N"
- Image is full width, object-contain
- Orange prev/next buttons

To get page count: when uploading, Cloudinary returns `pages` in the response. Store the slideUrl as JSON: `{"baseUrl": "...", "pages": 12}` or store baseUrl and pages separately.

Actually simpler: store slideUrl as the Cloudinary base URL (without extension), and store slidePages as a new Int field.

Add `slidePages Int @default(0)` to Lesson model in schema.prisma.

## Step 3: Update DB schema and content

- Add slidePages field
- Run prisma db push + prisma generate
- Update the 5 Module 1 lessons with new image base URLs and page counts
- Update admin panel to show slidePages field

## Install cloudinary npm package first if not already: npm install cloudinary

## After all changes
- npm run build (fix errors)
- git add -A && git commit -m "fix: Cloudinary image-based slide viewer with prev/next navigation"
- git push origin main  
- vercel --prod
- openclaw system event --text "Done: image slide viewer deployed" --mode now
