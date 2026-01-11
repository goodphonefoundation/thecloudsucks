import type { BlockColumn } from './block-column';
import type { BlockCta } from './block-cta';
import type { BlockFaq } from './block-faq';
import type { BlockForm } from './block-form';
import type { BlockGallery } from './block-gallery';
import type { BlockHero } from './block-hero';
import type { BlockHtml } from './block-html';
import type { BlockLogocloud } from './block-logocloud';
import type { BlockQuote } from './block-quote';
import type { BlockRichtext } from './block-richtext';
import type { BlockStep } from './block-steps';
import type { BlockTeam } from './block-team';
import type { BlockTestimonial } from './block-testimonial';
import type { BlockVideo } from './block-video';
import type { BlockDivider } from './block-divider';
import type { BlockServicesShowcase } from './block-services-showcase';
import type { BlockHardwareShowcase } from './block-hardware-showcase';
import type { BlockOsShowcase } from './block-os-showcase';
import type { BlockLatestServices } from './block-latest-services';
import type { BlockMobileAppsShowcase } from './block-mobile-apps-showcase';
import type { BlockSelfhostedShowcase } from './block-selfhosted-showcase';
import type { BlockWhitepaperContent } from './block-whitepaper-content';

export type BlockType =
	| 'block_services_showcase'
	| 'block_hardware_showcase'
	| 'block_os_showcase'
	| 'block_latest_services'
	| 'block_mobile_apps_showcase'
	| 'block_selfhosted_showcase'
	| 'block_columns'
	| 'block_cta'
	| 'block_faqs'
	| 'block_form'
	| 'block_gallery'
	| 'block_hero'
	| 'block_html'
	| 'block_logocloud'
	| 'block_quote'
	| 'block_richtext'
	| 'block_steps'
	| 'block_team'
	| 'block_testimonials'
	| 'block_video'
	| 'block_divider'
	| 'block_whitepaper_content'
	| 'block_privacy_pack_builder';

export type Block =
	| BlockServicesShowcase
	| BlockHardwareShowcase
	| BlockOsShowcase
	| BlockLatestServices
	| BlockMobileAppsShowcase
	| BlockSelfhostedShowcase
	| BlockColumn
	| BlockCta
	| BlockFaq
	| BlockForm
	| BlockGallery
	| BlockHero
	| BlockHtml
	| BlockLogocloud
	| BlockQuote
	| BlockRichtext
	| BlockStep
	| BlockTeam
	| BlockTestimonial
	| BlockVideo
	| BlockDivider
	| BlockWhitepaperContent;
