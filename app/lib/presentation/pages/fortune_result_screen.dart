import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/fortune_card.dart';
import '../widgets/element_display.dart';
import '../widgets/custom_button.dart';

class FortuneResultScreen extends ConsumerWidget {
  const FortuneResultScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('사주 분석 결과'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Main Fortune Card
              FortuneCard(
                heavenlyStem: '갑',
                earthlyBranch: '자',
                birthDate: '1990년 1월 15일 14:30',
              ),
              const SizedBox(height: 24),

              // Five Elements
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '오행 구성',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          ElementDisplay(
                            element: '목',
                            color: Color(0xFF27AE60),
                            count: 2,
                          ),
                          ElementDisplay(
                            element: '화',
                            color: Color(0xFFE74C3C),
                            count: 3,
                          ),
                          ElementDisplay(
                            element: '토',
                            color: Color(0xFFF39C12),
                            count: 1,
                          ),
                          ElementDisplay(
                            element: '금',
                            color: Color(0xFFECF0F1),
                            count: 2,
                          ),
                          ElementDisplay(
                            element: '수',
                            color: Color(0xFF3498DB),
                            count: 1,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Personality
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '성격 및 특징',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '독립적이고 적극적인 성향을 가진 사람입니다. 새로운 도전을 즐기며 뛰어난 리더십을 발휘합니다. 다만 조금 성급한 면이 있으므로 신중함이 필요합니다.',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Lucky Items
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '길한 것들',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          Column(
                            children: [
                              Container(
                                width: 60,
                                height: 60,
                                decoration: BoxDecoration(
                                  color: Color(0xFFFF6B6B),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '길한 색상',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                          Column(
                            children: [
                              Container(
                                width: 60,
                                height: 60,
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: Theme.of(context)
                                        .colorScheme
                                        .primary,
                                    width: 2,
                                  ),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Center(
                                  child: Text(
                                    '7',
                                    style: Theme.of(context)
                                        .textTheme
                                        .headlineSmall,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '길한 숫자',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Buttons
              CustomButton(
                text: '운세 상세보기',
                onPressed: () {
                  Navigator.of(context).pushNamed('/fortune_detail');
                },
              ),
              const SizedBox(height: 12),
              CustomButton(
                text: '홈으로 돌아가기',
                onPressed: () {
                  Navigator.of(context).pushReplacementNamed('/home');
                },
                isPrimary: false,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
