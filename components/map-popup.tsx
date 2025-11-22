import { motion } from 'framer-motion';

export default function MapPopup({ title, author, videoUrl, onDetails }: { title: string, author: string, videoUrl: string, onDetails?: () => void }) {

    const getYouTubeThumbnail = (url: string) => {
        let videoId;
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else {
            videoId = url.split('v=')[1]?.split('&')[0];
        }
        return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
    };

    const thumbnailUrl = getYouTubeThumbnail(videoUrl);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="min-w-[240px] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-sm"
        >
            <div className="relative aspect-video bg-muted">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={title} className="h-full w-full object-cover" />
                ) : null}
            </div>
            <div className="p-3">
                <h4 className="text-sm font-semibold leading-none tracking-tight">{title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">Enviado por {author}</p>
                <button
                    type="button"
                    onClick={onDetails}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    Detalhes
                </button>
            </div>
        </motion.div>
    );
};
