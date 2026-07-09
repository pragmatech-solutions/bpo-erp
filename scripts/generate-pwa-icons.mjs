import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'public', 'logo.png');
const outDir = path.join(root, 'public', 'icons');

fs.mkdirSync(outDir, { recursive: true });

async function generate() {
	// Standard icons: logo as-is, resized
	await sharp(source)
		.resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
		.png()
		.toFile(path.join(outDir, 'icon-192.png'));

	await sharp(source)
		.resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
		.png()
		.toFile(path.join(outDir, 'icon-512.png'));

	// Maskable icons: pad logo into ~80% safe zone so Android's mask doesn't clip it
	const buildMaskable = async (size, outName) => {
		const safeZone = Math.round(size * 0.8);
		const logo = await sharp(source)
			.resize(safeZone, safeZone, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
			.toBuffer();

		await sharp({
			create: {
				width: size,
				height: size,
				channels: 4,
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			},
		})
			.composite([{ input: logo, gravity: 'center' }])
			.png()
			.toFile(path.join(outDir, outName));
	};

	await buildMaskable(192, 'icon-maskable-192.png');
	await buildMaskable(512, 'icon-maskable-512.png');

	// Apple touch icon: flattened onto white, no transparency, 180x180
	const appleLogo = await sharp(source)
		.resize(150, 150, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
		.toBuffer();

	await sharp({
		create: {
			width: 180,
			height: 180,
			channels: 4,
			background: { r: 255, g: 255, b: 255, alpha: 1 },
		},
	})
		.composite([{ input: appleLogo, gravity: 'center' }])
		.flatten({ background: { r: 255, g: 255, b: 255 } })
		.png()
		.toFile(path.join(outDir, 'apple-touch-icon.png'));

	console.log('PWA icons generated in public/icons/');
}

generate().catch((err) => {
	console.error(err);
	process.exit(1);
});
