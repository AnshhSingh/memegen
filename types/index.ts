export type Generation = {
  id: number;
  user_id: string;
  created_at: string;
  prompt: string;
  image_url: string;
  used_revised_prompt: boolean;
  article_title: string;
  article_link: string;
  article_description: string;
  article_category: string[];
  article_pub_date: string;
};
//test