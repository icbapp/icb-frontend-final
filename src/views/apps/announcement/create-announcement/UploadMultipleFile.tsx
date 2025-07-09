'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import type { BoxProps } from '@mui/material/Box'

// Third-party Imports
import { useDropzone } from 'react-dropzone'

// Component Imports
import Link from '@components/Link'
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import Box from '@mui/material/Box'
import endPointApi from '@/utils/endPointApi'
import { api } from '@/utils/axiosInstance'
import { toast } from 'react-toastify'
import { getShortFileName } from '../../chat/utils'

type FileProp = {
  file_path: any
  id?: number; // existing files will have ID
  name: string;
  type: string;
  size: number;
  file?: File; // for new uploads
}

interface UploadMultipleFileProps {
  files: FileProp[];
  setFiles: React.Dispatch<React.SetStateAction<FileProp[]>>;
  fetchUsers: () => void
}
// Styled Dropzone Component
const Dropzone = styled(AppReactDropzone)<BoxProps>(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    padding: theme.spacing(12),
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(5)
    },
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight
    }
  }
}))

const UploadMultipleFile: React.FC<UploadMultipleFileProps> = ({ files, setFiles }) => {
  // Hooks
const { getRootProps, getInputProps } = useDropzone({
  onDrop: (acceptedFiles: File[]) => {
    const newFiles: FileProp[] = acceptedFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
      file_path: '',
    }))

    setFiles(prevFiles =>
      Array.isArray(prevFiles) ? [...prevFiles, ...newFiles] : [...newFiles]
    )
  },
 accept: {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'video/mp4': ['.mp4'],
  'audio/mpeg': ['.mp3'],
  'application/pdf': ['.pdf'],
  // 'application/msword': ['.doc'],
  // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
}

})


const renderFilePreview = (file: FileProp | any) => {
  const isImage =
    file?.type?.startsWith('image') ||
    file?.file_type?.startsWith('image') ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file?.file_path || '')

  if (isImage) {
    let src = ''

    if (file?.file?.preview) {
      src = file.file.preview
    } else if (file?.file_path?.startsWith('http')) {
      src = file.file_path
    } else {
      src = `${file.file_url}`
    }

    return <img width={38} height={38} alt={file.name || 'file'} src={src} />
  }

  return <i className='ri-file-text-line' />
}


const handleRemoveFile = (fileToRemove: FileProp) => {
  if (fileToRemove.id){
   api.delete(`${endPointApi.deleteImageAnnouncements}/${fileToRemove.id}`)
   .then((response) => {
     if(response.data.status === 200){
       toast.success("File deleted successfully!");
     }
   })  
  }
   
  setFiles(prevFiles =>
    prevFiles.filter(file =>
      file.id ? file.id !== fileToRemove.id : file.name !== fileToRemove.name
    )
  )
}

  const fileList = files?.map((file: FileProp) => (
    <ListItem key={file.name} className='pis-4 plb-3'>
      <div className='file-details'>
        <div className='file-preview'>{renderFilePreview(file)}</div>
        <div>
          <Typography className='file-name font-medium' color='text.primary'>
           {getShortFileName(file.name || file.file_path?.split('/').pop())}
            </Typography>
            {/* <Typography className='file-size' variant='body2'>
            {file.size
                ? Math.round(file.size / 100) / 10 > 1000
                ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
                : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`
                : file.file_type?.toUpperCase()}
            </Typography> */}
        </div>
      </div>
      <IconButton onClick={() => handleRemoveFile(file)}>
        <i className='ri-delete-bin-6-line text-xl' />
      </IconButton>
    </ListItem>
  ))

  const handleRemoveAllFiles = () => {
    setFiles([])
  }

  return (
    <Dropzone>
      <Card>
        <CardContent>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <div className='flex items-center flex-col gap-2 text-center'>
              <CustomAvatar variant='rounded' skin='light' color='secondary'>
                <i className='ri-upload-2-line' />
              </CustomAvatar>
              <Typography variant='h4'>Drag and Drop Your Image Here.</Typography>
              <Typography color='text.disabled'>or</Typography>
              <Button variant='outlined' size='small'>
                Browse Image
              </Button>
            </div>
          </div>
          {files?.length ? (
            <>
              <List sx={{ maxHeight: 200, overflowY: 'auto' }}>{fileList}</List>
              {/* <div className='buttons'>
                <Button color='secondary' variant='outlined' onClick={handleRemoveAllFiles}>
                  Remove All
                </Button>
              </div> */}
            </>
          ) : null}
        </CardContent>
      </Card>
    </Dropzone>
  )
}

export default UploadMultipleFile
