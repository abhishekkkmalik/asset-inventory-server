import { Link as RouterLink } from 'react-router'
import { Box, Card, CardContent, Chip, LinearProgress, Link, List, ListItem, ListItemText, Stack, Typography } from '@mui/material'
import ComputerIcon from '@mui/icons-material/ComputerOutlined'
import WifiIcon from '@mui/icons-material/WifiTetheringOutlined'
import AppsIcon from '@mui/icons-material/AppsOutlined'
import WarningIcon from '@mui/icons-material/GppMaybeOutlined'
import HistoryIcon from '@mui/icons-material/HistoryOutlined'
import { useStats } from '../api'
import { CardGrid, ErrorBox, Loading, PageHeader, SourceChip, StatCard } from '../components/common'
import { timeAgo } from '../format'

export default function Dashboard() {
  const { data, isLoading, error } = useStats()
  if (isLoading) return <Loading />
  if (error || !data) return <ErrorBox error={error} />

  const maxSw = Math.max(1, ...data.top_software.map((s) => s.machine_count))
  const maxPort = Math.max(1, ...data.top_ports.map((p) => p.machine_count))

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Current state of every machine, from its latest snapshot." />
      <CardGrid min={190}>
        <StatCard label="Machines" value={data.machines} icon={<ComputerIcon />} />
        <StatCard label="Online" value={data.online} hint={`seen in the last ${data.online_minutes} min`} icon={<WifiIcon />} />
        <StatCard label="Unique applications" value={data.unique_apps} icon={<AppsIcon />} />
        <StatCard label="Exposed ports" value={data.exposed_ports} hint="listening on a non-loopback address" icon={<WarningIcon />} />
        <StatCard label="Snapshots (24 h)" value={data.snapshots_24h} icon={<HistoryIcon />} />
      </CardGrid>

      <Box sx={{ display: 'grid', gap: 2, mt: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Most installed software</Typography>
            {data.top_software.length === 0 && <Typography color="text.secondary">No data yet.</Typography>}
            {data.top_software.map((s) => (
              <Box key={s.name} sx={{ mb: 1.5 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2" noWrap title={s.name}>{s.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.machine_count}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={(s.machine_count / maxSw) * 100} sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Most common open ports</Typography>
            {data.top_ports.length === 0 && <Typography color="text.secondary">No data yet.</Typography>}
            {data.top_ports.map((p) => (
              <Box key={`${p.protocol}-${p.port}`} sx={{ mb: 1.5 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', minWidth: 90 }}>{p.protocol} {p.port}</Typography>
                  {p.exposed && <Chip size="small" color="warning" label="Exposed" />}
                  <Box sx={{ flexGrow: 1 }} />
                  <Typography variant="body2" color="text.secondary">{p.machine_count}</Typography>
                </Stack>
                <LinearProgress variant="determinate" color={p.exposed ? 'warning' : 'primary'} value={(p.machine_count / maxPort) * 100}
                                sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Latest snapshots</Typography>
            <Link component={RouterLink} to="/snapshots">View all</Link>
          </Stack>
          {data.recent_snapshots.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              No data yet. Send data from the collector or <Link component={RouterLink} to="/upload">upload an Excel file</Link>.
            </Typography>
          )}
          <List dense>
            {data.recent_snapshots.map((s) => (
              <ListItem key={s.id} disableGutters secondaryAction={<SourceChip source={s.source} />}>
                <ListItemText
                  primary={<Link component={RouterLink} to={`/machines/${s.machine_id}`}>{s.hostname ?? s.machine_id}</Link>}
                  secondary={`${timeAgo(s.received_at)} · software ${s.software_count ?? '—'} · ports ${s.port_count ?? '—'}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </>
  )
}
