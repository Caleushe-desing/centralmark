import { Client } from "basic-ftp";
import fs from "fs/promises";
import path from "path";

export function isFtpConfigured(): boolean {
  return Boolean(
    process.env.FTP_HOST &&
      process.env.FTP_USER &&
      process.env.FTP_PASSWORD &&
      process.env.FTP_REMOTE_PATH
  );
}

export async function uploadToFtp(
  localFilePath: string,
  remoteFilename: string
): Promise<string> {
  const host = process.env.FTP_HOST;
  const user = process.env.FTP_USER;
  const password = process.env.FTP_PASSWORD;
  const remotePath = process.env.FTP_REMOTE_PATH;

  if (!host || !user || !password || !remotePath) {
    throw new Error("FTP no configurado");
  }

  const client = new Client(60_000);
  client.ftp.verbose = process.env.NODE_ENV === "development";

  try {
    await client.access({
      host,
      user,
      password,
      port: Number(process.env.FTP_PORT || 21),
      secure: process.env.FTP_SECURE === "true",
    });

    await client.ensureDir(remotePath);
    await client.uploadFrom(localFilePath, `${remotePath}/${remoteFilename}`);
  } finally {
    client.close();
  }

  const publicBase = (process.env.APP_PUBLIC_URL ?? "https://mizo.cl/markmall").replace(
    /\/$/,
    ""
  );
  return `${publicBase}/generated/${remoteFilename}`;
}

export async function publishGeneratedImage(
  localRelativePath: string
): Promise<string> {
  if (!isFtpConfigured()) {
    return localRelativePath;
  }

  const filename = path.basename(localRelativePath);
  const localFullPath = path.join(process.cwd(), "public", localRelativePath.replace(/^\//, ""));

  return uploadToFtp(localFullPath, filename);
}

/** Asegura que la imagen esté en FTP y devuelve URL pública */
export async function ensurePublicImageUrl(imagePath: string): Promise<string> {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  if (!isFtpConfigured()) {
    const base = (process.env.APP_PUBLIC_URL ?? "").replace(/\/$/, "");
    if (!base) throw new Error("APP_PUBLIC_URL no configurada");
    return `${base}${imagePath}`;
  }

  const publicUrl = await publishGeneratedImage(imagePath);
  return publicUrl;
}
