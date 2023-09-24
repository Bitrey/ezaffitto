export interface FbPost {
    id: string;
    postUrl: string;
    authorName?: string;
    authorUrl?: string;
    date: Date;
    images?: string[];
    groupId?: string;
    text: string;
}
