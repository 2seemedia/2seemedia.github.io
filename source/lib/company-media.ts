import portraits from './founder-assets.json';
import studio from './studio-assets.json';
import type {SiteContent} from './content';
// Apply the supplied company photos once; a later owner save retains the
// version and future dashboard replacements/removals remain authoritative.
export function applyCompanyMedia(value:SiteContent):SiteContent{
 if(value.companyMediaVersion===1)return value;
 const c=structuredClone(value);c.companyMediaVersion=1;
 c.founders=c.founders?.map(founder=>{
  const photo=portraits[founder.id as keyof typeof portraits];
  return photo?{...founder,image:photo.url,imageVariants:photo.variants,positionY:50}:founder;
 });
 c.studio={altAr:'من داخل استوديو 2SEE Media',altEn:'Inside the 2SEE Media studio',...c.studio,url:studio.url,variants:studio.variants,visible:true};
 return c;
}
