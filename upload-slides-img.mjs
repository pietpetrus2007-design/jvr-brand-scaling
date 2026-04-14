import { v2 as cloudinary } from 'cloudinary'
import { readdirSync } from 'fs'
import { join } from 'path'

cloudinary.config({
  cloud_name: 'dwnfccsje',
  api_key: '496952356133331',
  api_secret: '1kYnrqjzQf16C-J0altYjjlqoK0',
})

const files = [
  { path: '/tmp/slides-pdf/Lesson_1.1_What_Brand_Scaling_Actually_Is_v2---f68bcd37-b1d7-41b9-a6ee-f5332c468fd4.pdf', id: 'mod1-lesson1' },
  { path: '/tmp/slides-pdf/Lesson_1.2_Why_Brands_Need_This_v2---19cef991-837e-426a-b7b3-bad95c799a9b.pdf', id: 'mod1-lesson2' },
  { path: '/tmp/slides-pdf/Lesson_1.3_What_You_Are_Actually_Selling---468d0778-3c8c-4f84-8b6e-b0f009c8f031.pdf', id: 'mod1-lesson3' },
  { path: '/tmp/slides-pdf/Lesson_1.4_What_Your_Role_Is_and_What_It_Is_Not---89904aea-0a0c-4f47-bf29-c69d0d7cff77.pdf', id: 'mod1-lesson4' },
  { path: '/tmp/slides-pdf/Lesson_1.5_The_Opportunity_in_This_Business_Model---414bd2d9-e7d7-469a-8c3a-c74a7a753b00.pdf', id: 'mod1-lesson5' },
  { path: '/tmp/slides-mod2/Lesson_2.1_The_Simple_Brand_Scaling_Offer---74e7ccb4-50f5-4141-bfcc-c0915cdb47cf.pdf', id: 'mod2-lesson1' },
  { path: '/tmp/slides-mod2/Lesson_2.2_Positioning_Yourself_Properly---8d706e17-fd22-420f-8014-f2019702de1d.pdf', id: 'mod2-lesson2' },
  { path: '/tmp/slides-mod2/Lesson_2.3_Niching_Down_or_Staying_Broad---25d676e3-72bf-41ab-bf75-e5339f31693f.pdf', id: 'mod2-lesson3' },
  { path: '/tmp/slides-mod2/Lesson_2.4_What_Makes_an_Offer_Easy_to_Buy---32471b23-93d9-49aa-80d6-56d555cd5160.pdf', id: 'mod2-lesson4' },
  { path: '/tmp/slides-mod2/Lesson_2.5_Creating_Your_Offer_Statement---639f441f-8a59-40f8-8567-f7fc5dd63277.pdf', id: 'mod2-lesson5' },
]

for (const f of files) {
  const result = await cloudinary.uploader.upload(f.path, {
    resource_type: 'image',
    folder: 'jvr-brand-scaling/slides-img',
    public_id: f.id,
    overwrite: true,
  })
  console.log(`✅ ${f.id}: ${result.pages} pages — ${result.secure_url}`)
}
