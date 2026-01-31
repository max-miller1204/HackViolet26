import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useSocialStore } from '../../src/stores/socialStore';
import { useAuthStore } from '../../src/stores/authStore';
import { RideRequest, SocialPost } from '../../src/types';
import { Colors, BorderRadius, Typography, Spacing, Shadows, Gradients } from '../../src/components/ui/theme';

export default function SocialScreen() {
  const { user } = useAuthStore();
  const { posts, rideRequests, createRideRequest, getOpenRideRequests } = useSocialStore();
  const [activeTab, setActiveTab] = useState<'feed' | 'rides'>('feed');
  const [showCreateRide, setShowCreateRide] = useState(false);

  // Ride request form state
  const [rideType, setRideType] = useState<'need_ride' | 'offer_ride'>('need_ride');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');

  const openRides = getOpenRideRequests();

  const handleCreateRide = () => {
    if (!user || !fromLocation.trim() || !toLocation.trim()) return;

    createRideRequest(
      user.id,
      user.displayName,
      rideType,
      fromLocation.trim(),
      toLocation.trim(),
      new Date(Date.now() + 2 * 60 * 60 * 1000) // Default 2 hours from now
    );

    setFromLocation('');
    setToLocation('');
    setShowCreateRide(false);
  };

  const renderPost = (post: SocialPost) => (
    <View key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.userDisplayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.postHeaderInfo}>
          <Text style={styles.posterName}>{post.userDisplayName}</Text>
          <Text style={styles.postTime}>
            {format(new Date(post.createdAt), 'h:mm a')}
          </Text>
        </View>
        {post.type === 'ride_request' && (
          <View style={[styles.postTypeBadge, { backgroundColor: Colors.primary + '20' }]}>
            <Ionicons name="car" size={12} color={Colors.primary} />
            <Text style={[styles.postTypeBadgeText, { color: Colors.primary }]}>Ride</Text>
          </View>
        )}
      </View>
      <Text style={styles.postContent}>{post.content}</Text>

      {post.rideRequest && (
        <View style={styles.rideDetails}>
          <View style={styles.rideRoute}>
            <View style={styles.ridePoint}>
              <View style={[styles.routeDot, { backgroundColor: Colors.safe }]} />
              <Text style={styles.rideLocation}>{post.rideRequest.fromLocation}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.ridePoint}>
              <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.rideLocation}>{post.rideRequest.toLocation}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.respondButton}>
            <Text style={styles.respondButtonText}>
              {post.rideRequest.type === 'need_ride' ? 'Offer Ride' : 'Request Spot'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderRideRequest = (ride: RideRequest) => (
    <View key={ride.id} style={styles.rideCard}>
      <View style={styles.rideCardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {ride.userDisplayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.rideCardHeaderInfo}>
          <Text style={styles.riderName}>{ride.userDisplayName}</Text>
          <View style={[styles.rideTypeBadge, {
            backgroundColor: ride.type === 'offer_ride' ? Colors.safe + '20' : Colors.secondary + '20'
          }]}>
            <Ionicons
              name={ride.type === 'offer_ride' ? 'car' : 'hand-right'}
              size={12}
              color={ride.type === 'offer_ride' ? Colors.safe : Colors.secondary}
            />
            <Text style={[styles.rideTypeBadgeText, {
              color: ride.type === 'offer_ride' ? Colors.safe : Colors.secondary
            }]}>
              {ride.type === 'offer_ride' ? 'Offering' : 'Needs Ride'}
            </Text>
          </View>
        </View>
        <Text style={styles.rideTime}>
          {format(new Date(ride.departureTime), 'h:mm a')}
        </Text>
      </View>

      <View style={styles.rideRoute}>
        <View style={styles.ridePoint}>
          <View style={[styles.routeDot, { backgroundColor: Colors.safe }]} />
          <Text style={styles.rideLocation}>{ride.fromLocation}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.ridePoint}>
          <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.rideLocation}>{ride.toLocation}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.connectButton}>
        <Ionicons name="chatbubble" size={16} color={Colors.white} />
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>Connect with others for safer nights</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.tabActive]}
          onPress={() => setActiveTab('feed')}
        >
          <Ionicons
            name="newspaper"
            size={18}
            color={activeTab === 'feed' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rides' && styles.tabActive]}
          onPress={() => setActiveTab('rides')}
        >
          <Ionicons
            name="car"
            size={18}
            color={activeTab === 'rides' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'rides' && styles.tabTextActive]}>
            Ride Share
          </Text>
          {openRides.length > 0 && (
            <View style={styles.rideBadge}>
              <Text style={styles.rideBadgeText}>{openRides.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'feed' ? (
          posts.map(renderPost)
        ) : (
          <>
            {/* Create Ride Button */}
            <TouchableOpacity
              style={styles.createRideCard}
              onPress={() => setShowCreateRide(true)}
            >
              <View style={styles.createRideIcon}>
                <Ionicons name="add" size={24} color={Colors.primary} />
              </View>
              <View style={styles.createRideInfo}>
                <Text style={styles.createRideTitle}>Need or Offer a Ride?</Text>
                <Text style={styles.createRideSubtitle}>
                  Connect with verified users heading your way
                </Text>
              </View>
            </TouchableOpacity>

            {/* Ride Requests List */}
            {openRides.map(renderRideRequest)}
          </>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Create Ride Modal */}
      <Modal visible={showCreateRide} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share a Ride</Text>
              <TouchableOpacity onPress={() => setShowCreateRide(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Ride Type Toggle */}
            <View style={styles.rideTypeToggle}>
              <TouchableOpacity
                style={[styles.rideTypeOption, rideType === 'need_ride' && styles.rideTypeOptionActive]}
                onPress={() => setRideType('need_ride')}
              >
                <Ionicons
                  name="hand-right"
                  size={20}
                  color={rideType === 'need_ride' ? Colors.white : Colors.textSecondary}
                />
                <Text style={[styles.rideTypeText, rideType === 'need_ride' && styles.rideTypeTextActive]}>
                  Need a Ride
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rideTypeOption, rideType === 'offer_ride' && styles.rideTypeOptionActive]}
                onPress={() => setRideType('offer_ride')}
              >
                <Ionicons
                  name="car"
                  size={20}
                  color={rideType === 'offer_ride' ? Colors.white : Colors.textSecondary}
                />
                <Text style={[styles.rideTypeText, rideType === 'offer_ride' && styles.rideTypeTextActive]}>
                  Offer a Ride
                </Text>
              </TouchableOpacity>
            </View>

            {/* Location Inputs */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>From</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Starting location"
                placeholderTextColor={Colors.textMuted}
                value={fromLocation}
                onChangeText={setFromLocation}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>To</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Destination"
                placeholderTextColor={Colors.textMuted}
                value={toLocation}
                onChangeText={setToLocation}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, (!fromLocation.trim() || !toLocation.trim()) && styles.submitButtonDisabled]}
              onPress={handleCreateRide}
              disabled={!fromLocation.trim() || !toLocation.trim()}
            >
              <Text style={styles.submitButtonText}>Post Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
  },
  headerSubtitle: {
    color: Colors.white,
    fontSize: Typography.base,
    opacity: 0.9,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.primary + '20',
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  rideBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: 4,
  },
  rideBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: Typography.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  postHeaderInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  posterName: {
    color: Colors.text,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  postTime: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  postTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  postTypeBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  postContent: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  rideDetails: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rideRoute: {
    marginBottom: Spacing.md,
  },
  ridePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 4,
  },
  rideLocation: {
    color: Colors.text,
    fontSize: Typography.sm,
  },
  respondButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  respondButtonText: {
    color: Colors.white,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  createRideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    borderStyle: 'dashed',
  },
  createRideIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createRideInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  createRideTitle: {
    color: Colors.text,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  createRideSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    marginTop: 2,
  },
  rideCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  rideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  rideCardHeaderInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  riderName: {
    color: Colors.text,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  rideTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  rideTypeBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  rideTime: {
    color: Colors.primary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  connectButtonText: {
    color: Colors.white,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
  },
  rideTypeToggle: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  rideTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  rideTypeOptionActive: {
    backgroundColor: Colors.primary,
  },
  rideTypeText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  rideTypeTextActive: {
    color: Colors.white,
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  formLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    marginBottom: Spacing.xs,
  },
  formInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: Typography.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
});
