import React, { useEffect, useState } from 'react';
import { PageContainer } from '../../../components/User/PageContainer';
import { SectionHeader } from '../../../components/User/SectionHeader';
import { BackButton } from '../../../components/User/BackButton';
import { subscribeGalleryPhotos, type GalleryPhoto } from '../../../services/galleryService';
import { Camera, Calendar, Star } from 'lucide-react';

interface UserGalleryViewProps {
  onBack: () => void;
}

export const UserGalleryView: React.FC<UserGalleryViewProps> = ({ onBack }) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    // Subscribe to Firestore galleryPhotos collection in real time
    const unsubscribe = subscribeGalleryPhotos((items) => {
      const valid = items.filter(
        (p) => p && p.imageUrl && p.imageUrl.trim().length > 0 && !p.imageUrl.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?.*)?$/i)
      );
      setPhotos(valid);
    });

    return () => unsubscribe();
  }, []);

  return (
    <PageContainer maxWidth="6xl">
      <BackButton onClick={onBack} label="Back to Universe" />

      <SectionHeader
        badge="Constellation Gallery"
        title="Constellation Memories"
        subtitle="A collection of cherished snapshots and timeless moments stored across the stars."
      />

      {/* Gallery Grid */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Camera className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-100">Constellation is Waiting</h3>
            <p className="text-sm text-slate-400 max-w-md">
              When Sanjana uploads memories in Admin Panel, your gallery will automatically appear here in real time.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="interactive group backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/50 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Photo Image Container */}
              <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                {photo.imageUrl && photo.imageUrl.trim().length > 0 && (
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || 'Memory'}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Favorite Badge */}
                {photo.favorite && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/30 backdrop-blur-md border border-amber-400/80 text-amber-200 text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Favorite</span>
                  </div>
                )}
              </div>

              {/* Caption & Memory Date */}
              <div className="p-4 space-y-2 bg-gradient-to-b from-slate-900/40 to-slate-950/80">
                {photo.caption && (
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-rose-300 transition-colors line-clamp-2">
                    {photo.caption}
                  </h4>
                )}

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  <span>{photo.memoryDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && selectedPhoto.imageUrl && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption}
                className="max-w-full max-h-[75vh] object-contain"
              />
            </div>
            <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{selectedPhoto.caption}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedPhoto.memoryDate}</p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
