import axios from 'axios';

export interface ServiceResearchData {
	name: string;
	short_description: string;
	long_description?: string;
	website_url: string;
	repo_url?: string;
	docs_url?: string;
	privacy_policy_url?: string;
	terms_url?: string;
	self_hostable: boolean;
	federated: boolean;
	end_to_end_encryption: 'yes' | 'partial' | 'no' | 'unknown';
	open_source_clients: 'yes' | 'partial' | 'no' | 'unknown';
	open_source_server: 'yes' | 'partial' | 'no' | 'unknown';
	primary_business_model?: string;
	governance_model?: string;
	categories?: string[];
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function researchSocialServices(count: number = 5): Promise<ServiceResearchData[]> {
	const apiKey = process.env.PERPLEXITY_API_KEY;
	
	if (!apiKey) {
		throw new Error('PERPLEXITY_API_KEY environment variable is not set');
	}

	const prompt = `Research ${count} emerging or noteworthy privacy-focused social media and messaging services that prioritize user autonomy, data privacy, and digital sovereignty. Focus on services that are:
- Active and currently available
- Have a focus on privacy, encryption, or user autonomy
- Are alternatives to mainstream services like WhatsApp, Facebook, Instagram, Twitter, etc.
- Include both well-known privacy-focused services and newer emerging platforms

For each service, provide the following information in valid JSON format:
{
  "name": "Service Name",
  "short_description": "One sentence description (max 200 chars)",
  "long_description": "Detailed description (2-3 paragraphs)",
  "website_url": "https://...",
  "repo_url": "https://github.com/..." (if open source),
  "docs_url": "https://..." (if available),
  "privacy_policy_url": "https://..." (if available),
  "terms_url": "https://..." (if available),
  "self_hostable": true/false,
  "federated": true/false (supports ActivityPub, Matrix, XMPP, etc.),
  "end_to_end_encryption": "yes"/"partial"/"no"/"unknown",
  "open_source_clients": "yes"/"partial"/"no"/"unknown",
  "open_source_server": "yes"/"partial"/"no"/"unknown",
  "primary_business_model": "subscription"/"donation"/"ads"/"mixed"/"unknown",
  "governance_model": "corporate"/"foundation"/"community_project"/"coop"/"unknown",
  "categories": ["Messaging", "Social Media", "etc."]
}

Return ONLY a JSON array with exactly ${count} services. Do not include any explanatory text, only the JSON array.`;

	try {
		const response = await axios.post(
			PERPLEXITY_API_URL,
			{
				model: 'sonar-pro',
				messages: [
					{
						role: 'system',
						content: 'You are a research assistant specializing in privacy-focused technology. Always respond with valid JSON only, no additional text.',
					},
					{
						role: 'user',
						content: prompt,
					},
				],
				temperature: 0.2,
				max_tokens: 4000,
			},
			{
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const content = response.data.choices[0].message.content;
		
		// Try to extract JSON from the response
		let jsonData;
		try {
			// First, try to parse directly
			jsonData = JSON.parse(content);
		} catch {
			// If that fails, try to extract JSON from markdown code blocks
			const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
			if (jsonMatch) {
				jsonData = JSON.parse(jsonMatch[1]);
			} else {
				// Last resort: try to find JSON array anywhere in the text
				const arrayMatch = content.match(/\[[\s\S]*\]/);
				if (arrayMatch) {
					jsonData = JSON.parse(arrayMatch[0]);
				} else {
					throw new Error('Could not extract valid JSON from Perplexity response');
				}
			}
		}

		if (!Array.isArray(jsonData)) {
			throw new Error('Perplexity response is not a JSON array');
		}

		// Validate and normalize the data
		const services: ServiceResearchData[] = jsonData.map((service: any) => {
			if (!service.name || !service.website_url) {
				throw new Error(`Invalid service data: missing required fields (name or website_url)`);
			}

			return {
				name: service.name,
				short_description: service.short_description || '',
				long_description: service.long_description || '',
				website_url: service.website_url,
				repo_url: service.repo_url || undefined,
				docs_url: service.docs_url || undefined,
				privacy_policy_url: service.privacy_policy_url || undefined,
				terms_url: service.terms_url || undefined,
				self_hostable: Boolean(service.self_hostable),
				federated: Boolean(service.federated),
				end_to_end_encryption: service.end_to_end_encryption || 'unknown',
				open_source_clients: service.open_source_clients || 'unknown',
				open_source_server: service.open_source_server || 'unknown',
				primary_business_model: service.primary_business_model || 'unknown',
				governance_model: service.governance_model || 'unknown',
				categories: Array.isArray(service.categories) ? service.categories : [],
			};
		});

		return services;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(`Perplexity API error: ${error.response?.data?.error?.message || error.message}`);
		}
		throw error;
	}
}
