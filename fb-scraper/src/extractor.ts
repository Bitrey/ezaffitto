import _ from "lodash";
import { FbPost } from "./interfaces/FbPost";

class MaybeArray<T> {
    constructor(public value: T[]) {}

    map<U>(f: (t: T) => U): U[] {
        return Array.isArray(this.value) ? this.value.map(f) : [];
    }
}

// each field may not exist or be null or undefined
type PartialFbPost = Partial<FbPost>;

export function extractor(elem: any): PartialFbPost {
    const props: PartialFbPost = {};

    props.id =
        elem?.data?.node?.group_feed?.edges[0]?.node?.post_id ||
        elem?.data?.node?.post_id ||
        elem?.data?.node?.group_feed?.edges[0]?.node?.comet_sections?.feedback
            ?.story?.feedback_context?.feedback_target_with_context
            ?.ufi_renderer?.feedback?.plugins[0]?.post_id ||
        elem?.data?.node?.group_feed?.edges[0]?.node?.comet_sections?.feedback
            ?.story?.feedback_context?.feedback_target_with_context
            ?.ufi_renderer?.feedback?.comet_ufi_summary_and_actions_renderer
            ?.feedback?.subscription_target_id;

    props.postUrl =
        elem?.data?.node?.group_feed?.edges[0]?.node?.comet_sections?.feedback
            ?.story?.url ||
        elem?.data?.node?.comet_sections?.content?.story?.wwwURL ||
        elem?.data?.node?.comet_sections?.feedback?.story?.feedback_context
            ?.feedback_target_with_context?.ufi_renderer?.feedback?.url ||
        elem?.data?.node?.comet_sections?.feedback?.story
            ?.shareable_from_perspective_of_feed_ufi?.url ||
        elem?.data?.node?.comet_sections?.feedback?.story?.url;

    props.authorName =
        elem?.data?.node?.group_feed?.edges[0]?.node?.comet_sections?.content
            ?.story?.actors[0]?.name ||
        elem?.data?.node?.comet_sections?.content?.story?.comet_sections
            ?.context_layout?.story?.comet_sections?.title?.story?.actors[0]
            ?.name ||
        elem?.data?.node?.group_feed?.edges[0]?.node?.comet_sections?.content
            ?.story?.comet_sections?.context_layout?.story?.comet_sections
            ?.actor_photo?.story?.actors[0]?.name ||
        elem?.data?.node?.group_feed?.edges[0]?.node?.comet_sections
            ?.context_layout?.story?.comet_sections?.actor_photo?.story
            ?.actors[0]?.name ||
        elem?.data?.node?.group_feed?.edges[0]?.node?.comet_sections?.feedback
            ?.story?.feedback_context?.feedback_target_with_context
            ?.ufi_renderer?.feedback?.owning_profile?.name;

    props.authorUrl =
        elem?.data?.node?.comet_sections?.content?.story?.comet_sections?.context_layout?.story?.comet_sections?.title?.story?.actors[0]?.url;

    const epoch = [
        ...new MaybeArray(
            elem?.data?.node?.comet_sections?.content?.story?.comet_sections?.context_layout?.story?.comet_sections?.metadata
        )?.map((m: any) => m?.story?.creation_time),
        ...new MaybeArray(elem?.data?.node?.group_feed?.edges)?.map(
            (e: any) =>
                e?.node?.comet_sections?.content?.story?.comet_sections
                    ?.context_layout?.story?.comet_sections?.metadata[0]?.story
                    ?.creation_time
        )
    ]?.filter(e => e)[0];
    props.date = epoch ? new Date(epoch * 1000) : undefined;

    props.images = _.flatten([
        ...new MaybeArray(
            elem?.data?.node?.comet_sections?.content?.story?.attachments
        )?.map((i: any) =>
            i?.styles?.attachment?.all_subattachments?.nodes
                ?.map((e: any) => e?.media?.image?.uri)
                .filter((s: any) => s)
        ),
        ...new MaybeArray(elem?.data?.node?.group_feed?.edges)?.map((e: any) =>
            new MaybeArray(e?.node?.comet_sections?.content?.story?.attachments)
                ?.map(
                    (a: any) =>
                        a?.styles?.attachment?.media?.large_share_image?.uri
                )
                ?.filter((s: any) => s)
        )
    ]).filter((s: any) => s);

    (props.groupId =
        elem?.data?.node?.comet_sections?.content?.story?.target_group?.id ||
        elem?.data?.node?.comet_sections?.context_layout?.story?.comet_sections
            ?.title?.story?.comet_sections?.action_link?.group?.id ||
        elem?.data?.node?.comet_sections?.feedback?.story?.feedback_context
            ?.feedback_target_with_context?.ufi_renderer?.feedback
            ?.comet_ufi_summary_and_actions_renderer?.feedback
            ?.ufi_action_renderers[0]?.feedback
            ?.if_viewer_cannot_use_group_custom_reactions_beta?.associated_group
            ?.id ||
        elem?.data?.node?.comet_sections?.feedback?.story?.feedback_context
            ?.feedback_target_with_context?.ufi_renderer?.feedback?.plugins[0]
            ?.group_id ||
        elem?.data?.node?.comet_sections?.feedback?.story?.feedback_context
            ?.feedback_target_with_context?.ufi_renderer?.feedback?.plugins[14]
            ?.group?.id),
        (props.text =
            elem?.data?.node?.comet_sections?.content?.story?.message?.text ||
            elem?.data?.node?.comet_sections?.content?.story?.comet_sections
                ?.message?.story?.message?.text ||
            elem?.data?.node?.group_feed?.edges[0]?.node?.comet_sections
                ?.content?.story?.message?.text);

    return props;
}
