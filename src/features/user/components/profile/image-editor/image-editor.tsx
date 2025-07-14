'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    IconRefresh,
    IconRotate,
    IconRotateClockwise,
    IconZoomIn,
    IconZoomOut,
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';

export interface ImageEditData {
    rotation: number;
    zoom: number;
    crop: { x: number; y: number };
    croppedAreaPixels: any;
}

interface ImageEditorProps {
    src: string;
    onEditChange: (editData: ImageEditData) => void;
    onProcessedImageChange: (processedImageUrl: string) => void;
}

export function ImageEditor({ src, onEditChange, onProcessedImageChange }: ImageEditorProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const handleCropComplete = useCallback(
        (croppedArea: any, croppedAreaPixels: any) => {
            setCroppedAreaPixels(croppedAreaPixels);

            const editData: ImageEditData = {
                rotation,
                zoom,
                crop,
                croppedAreaPixels,
            };

            onEditChange(editData);
            generateCroppedImage(editData);
        },
        [crop, rotation, zoom, onEditChange]
    );

    const generateCroppedImage = useCallback(
        async (editData: ImageEditData) => {
            try {
                const croppedImage = await getCroppedImg(
                    src,
                    editData.croppedAreaPixels,
                    editData.rotation
                );
                onProcessedImageChange(croppedImage);
            } catch (error) {
                console.error('Error generating cropped image:', error);
            }
        },
        [src, onProcessedImageChange]
    );

    const handleRotate = useCallback(
        (degrees: number) => {
            const newRotation = (rotation + degrees) % 360;
            setRotation(newRotation);
        },
        [rotation]
    );

    const handleZoomChange = useCallback((value: number[]) => {
        setZoom(value[0]);
    }, []);

    const resetToDefaults = useCallback(() => {
        setCrop({ x: 0, y: 0 });
        setRotation(0);
        setZoom(1);
    }, []);

    return (
        <div className="space-y-6">
            {/* Cropper Interface */}
            <div className="relative">
                <Card className="overflow-hidden p-0">
                    <CardContent className="p-0">
                        <div className="relative w-full" style={{ height: '400px' }}>
                            <Cropper
                                image={src}
                                crop={crop}
                                rotation={rotation}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onRotationChange={setRotation}
                                onCropComplete={handleCropComplete}
                                onZoomChange={setZoom}
                                style={{
                                    containerStyle: {
                                        background: 'hsl(var(--background))',
                                        borderRadius: '8px',
                                    },
                                    cropAreaStyle: {
                                        border: '2px solid hsl(var(--primary))',
                                        color: 'hsl(var(--primary))',
                                    },
                                    mediaStyle: {
                                        borderRadius: '8px',
                                    },
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <div className="text-center mt-2">
                    <p className="text-sm text-muted-foreground">
                        Drag to reposition • Scroll or pinch to zoom • Use controls below for more
                        options
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
                {/* Zoom and Rotation Controls Row */}
                <div className="flex items-end gap-8">
                    {/* Zoom Controls */}
                    <div className="flex-1">
                        <Label className="text-sm font-medium">Zoom</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleZoomChange([Math.max(1, zoom - 0.1)])}
                            >
                                <IconZoomOut className="w-4 h-4" />
                            </Button>
                            <Slider
                                value={[zoom]}
                                onValueChange={handleZoomChange}
                                min={1}
                                max={3}
                                step={0.1}
                                className="flex-1"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleZoomChange([Math.min(3, zoom + 0.1)])}
                            >
                                <IconZoomIn className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground w-12">
                                {Math.round(zoom * 100)}%
                            </span>
                        </div>
                    </div>

                    {/* Rotation Controls */}
                    <div>
                        <Label className="text-sm font-medium">Rotation</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => handleRotate(-90)}>
                                <IconRotate className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRotate(90)}>
                                <IconRotateClockwise className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground ml-2 w-8 text-right">
                                {rotation}°
                            </span>
                        </div>
                    </div>
                </div>

                {/* Reset Button */}
                <div className="flex justify-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" onClick={resetToDefaults}>
                                    <IconRefresh className="w-4 h-4 mr-2" />
                                    Reset to Default
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Reset zoom, rotation and crop to default values</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}

// Helper function to generate cropped image
const getCroppedImg = (imageSrc: string, pixelCrop: any, rotation = 0): Promise<string> => {
    return new Promise((resolve, reject) => {
        const image = new Image();

        // Only set crossOrigin for external URLs, not for blob URLs
        if (!imageSrc.startsWith('blob:')) {
            image.crossOrigin = 'anonymous';
        }

        image.addEventListener('load', () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                // Set canvas size to the crop size
                canvas.width = pixelCrop.width;
                canvas.height = pixelCrop.height;

                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Save the canvas state
                ctx.save();

                // Move to center for rotation
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate((rotation * Math.PI) / 180);

                // Draw the cropped portion of the image
                ctx.drawImage(
                    image,
                    pixelCrop.x,
                    pixelCrop.y,
                    pixelCrop.width,
                    pixelCrop.height,
                    -pixelCrop.width / 2,
                    -pixelCrop.height / 2,
                    pixelCrop.width,
                    pixelCrop.height
                );

                // Restore the canvas state
                ctx.restore();

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            resolve(url);
                        } else {
                            reject(new Error('Canvas toBlob failed'));
                        }
                    },
                    'image/jpeg',
                    0.9
                );
            } catch (error) {
                reject(error);
            }
        });

        image.addEventListener('error', (error) => {
            reject(new Error(`Failed to load image: ${error}`));
        });

        // Set the source last to trigger loading
        image.src = imageSrc;
    });
};
