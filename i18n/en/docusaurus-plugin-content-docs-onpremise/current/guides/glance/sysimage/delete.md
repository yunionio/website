---
sidebar_position: 4
---

# Delete Image

## Climc Command Delete Image

Images have delete protection enabled by default. When the image is definitely not needed, you need to first disable delete protection through `climc image-update`, then delete the image through `climc image-delete`.

```bash
# Disable image delete protection
$ climc image-update --unprotected <image_id>

# Delete image
$ climc image-delete <image_id>
```


