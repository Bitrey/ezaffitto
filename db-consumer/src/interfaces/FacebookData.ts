export interface FacebookData {
    post_id: string;
    text: string;
    post_text: string;
    shared_text: string;
    original_text: string;
    time: string;
    timestamp: number;
    image: string;
    image_lowquality: string;
    images: string[];
    images_description: string[];
    images_lowquality: string[];
    images_lowquality_description: string[];
    video: string | null;
    video_duration_seconds: number | null;
    video_height: number | null;
    video_id: string | null;
    video_quality: string | null;
    video_size_MB: number | null;
    video_thumbnail: string | null;
    video_watches: number | null;
    video_width: number | null;
    likes: number;
    comments: number;
    shares: number;
    post_url: string;
    link: string | null;
    links: Link[];
    user_id: string;
    username: string;
    user_url: string;
}

interface Link {
    link: string;
    text: string;
}
